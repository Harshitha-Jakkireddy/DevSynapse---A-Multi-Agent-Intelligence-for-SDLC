import json

from app.services.llm_service import LLMService
from app.models.planning import PlanningResponse
from app.agents.requirements_agent import RequirementsAgent


class PlanningAgent:

    def __init__(self):
        self.llm = LLMService()

    # --------------------------------------------------
    # HELPERS
    # --------------------------------------------------

    @staticmethod
    def _compact_json(data):
        """Serialize data without unnecessary whitespace."""
        return json.dumps(
            data,
            ensure_ascii=False,
            separators=(",", ":"),
        )

    @staticmethod
    def _parse_object(value):
        """Convert a JSON string to a dictionary when possible."""
        if isinstance(value, dict):
            return value

        if isinstance(value, str):
            value = value.strip()

            if not value:
                return None

            try:
                parsed = json.loads(value)
                return parsed if isinstance(parsed, dict) else None
            except json.JSONDecodeError:
                return None

        return None

    @staticmethod
    def _string_list(value, field_name):
        """Normalize string arrays and reject invalid values."""
        if value is None:
            return []

        if not isinstance(value, list):
            raise ValueError(
                f"Planning field '{field_name}' must be an array."
            )

        return [
            item.strip()
            for item in value
            if isinstance(item, str) and item.strip()
        ]

    def _normalize_plan(self, data, current_plan=None):
        """
        Normalize model output before Pydantic validation.

        Invalid generated sprints/tasks can reuse the corresponding
        existing sprint/task during an edit. Initial generation has
        no fallback and therefore rejects incomplete output.
        """
        if not isinstance(data, dict):
            raise ValueError(
                "Planning Agent must return a JSON object."
            )

        data = dict(data)
        current_plan = current_plan or {}

        # Preserve required top-level fields if omitted during editing.
        for field in (
            "project_name",
            "project_overview",
            "estimated_timeline",
        ):
            value = data.get(field)

            if not isinstance(value, str) or not value.strip():
                fallback = current_plan.get(field)

                if isinstance(fallback, str) and fallback.strip():
                    data[field] = fallback
                else:
                    raise ValueError(
                        f"Planning Agent returned an invalid '{field}'."
                    )

        # Normalize development phases.
        generated_phases = data.get("development_phases")
        existing_phases = current_plan.get("development_phases", [])

        if not isinstance(generated_phases, list):
            generated_phases = []

        if not isinstance(existing_phases, list):
            existing_phases = []

        normalized_phases = []

        for index in range(3):
            phase = (
                self._parse_object(generated_phases[index])
                if index < len(generated_phases)
                else None
            )

            if phase is None and index < len(existing_phases):
                phase = self._parse_object(existing_phases[index])

            if phase is None:
                continue

            required_phase_fields = (
                "phase",
                "description",
                "estimated_duration",
            )

            if not all(
                isinstance(phase.get(field), str)
                and phase[field].strip()
                for field in required_phase_fields
            ):
                if index < len(existing_phases):
                    fallback = self._parse_object(
                        existing_phases[index]
                    )

                    if fallback is not None and all(
                        isinstance(fallback.get(field), str)
                        and fallback[field].strip()
                        for field in required_phase_fields
                    ):
                        phase = fallback
                    else:
                        continue
                else:
                    continue

            normalized_phases.append(phase)

        if len(normalized_phases) != 3:
            raise ValueError(
                "Planning Agent must return 3 valid development phases."
            )

        data["development_phases"] = normalized_phases

        # Normalize exactly three sprints.
        generated_sprints = data.get("sprints")
        existing_sprints = current_plan.get("sprints", [])

        if not isinstance(generated_sprints, list):
            generated_sprints = []

        if not isinstance(existing_sprints, list):
            existing_sprints = []

        normalized_sprints = []

        for index in range(3):
            sprint = (
                self._parse_object(generated_sprints[index])
                if index < len(generated_sprints)
                else None
            )

            # If the model returned "", null, or another malformed
            # value, reuse the corresponding existing sprint.
            if sprint is None and index < len(existing_sprints):
                sprint = self._parse_object(existing_sprints[index])

            if sprint is None:
                raise ValueError(
                    f"Planning Agent returned no valid sprint "
                    f"at position {index + 1}."
                )

            # Normalize sprint number.
            sprint["sprint_number"] = index + 1

            for field in (
                "title",
                "goal",
                "estimated_duration",
            ):
                if (
                    not isinstance(sprint.get(field), str)
                    or not sprint[field].strip()
                ):
                    fallback = (
                        self._parse_object(existing_sprints[index])
                        if index < len(existing_sprints)
                        else None
                    )

                    fallback_value = (
                        fallback.get(field)
                        if fallback is not None
                        else None
                    )

                    if (
                        isinstance(fallback_value, str)
                        and fallback_value.strip()
                    ):
                        sprint[field] = fallback_value
                    else:
                        raise ValueError(
                            f"Sprint {index + 1} has an invalid "
                            f"'{field}' field."
                        )

            generated_tasks = sprint.get("tasks")
            existing_tasks = []

            if index < len(existing_sprints):
                existing_sprint = self._parse_object(
                    existing_sprints[index]
                )

                if existing_sprint:
                    existing_tasks = existing_sprint.get("tasks", [])

            if not isinstance(generated_tasks, list):
                generated_tasks = []

            if not isinstance(existing_tasks, list):
                existing_tasks = []

            normalized_tasks = []

            for task_index in range(3):
                task = (
                    self._parse_object(generated_tasks[task_index])
                    if task_index < len(generated_tasks)
                    else None
                )

                if task is None and task_index < len(existing_tasks):
                    task = self._parse_object(
                        existing_tasks[task_index]
                    )

                if task is None:
                    raise ValueError(
                        f"Sprint {index + 1} has no valid task "
                        f"at position {task_index + 1}."
                    )

                for field in ("title", "description"):
                    if (
                        not isinstance(task.get(field), str)
                        or not task[field].strip()
                    ):
                        fallback_task = (
                            self._parse_object(
                                existing_tasks[task_index]
                            )
                            if task_index < len(existing_tasks)
                            else None
                        )

                        fallback_value = (
                            fallback_task.get(field)
                            if fallback_task
                            else None
                        )

                        if (
                            isinstance(fallback_value, str)
                            and fallback_value.strip()
                        ):
                            task[field] = fallback_value
                        else:
                            raise ValueError(
                                f"Sprint {index + 1}, task "
                                f"{task_index + 1} has invalid "
                                f"'{field}'."
                            )

                priority = str(
                    task.get("priority", "Medium")
                ).strip().capitalize()

                if priority not in {"High", "Medium", "Low"}:
                    priority = "Medium"

                task["priority"] = priority

                try:
                    hours = int(task.get("estimated_hours", 8))
                    if hours < 1:
                        hours = 8
                except (TypeError, ValueError):
                    hours = 8

                task["estimated_hours"] = hours

                task_id = task.get("id")

                if not isinstance(task_id, str) or not task_id.strip():
                    task_id = (
                        f"TASK-{index * 3 + task_index + 1:03d}"
                    )

                task["id"] = task_id.strip()

                dependencies = task.get("dependencies", [])

                if not isinstance(dependencies, list):
                    dependencies = []

                task["dependencies"] = [
                    item.strip()
                    for item in dependencies
                    if isinstance(item, str) and item.strip()
                ]

                normalized_tasks.append(task)

            sprint["tasks"] = normalized_tasks
            normalized_sprints.append(sprint)

        # Task IDs must be unique across the entire plan.
        used_ids = set()

        for sprint_index, sprint in enumerate(normalized_sprints):
            for task_index, task in enumerate(sprint["tasks"]):
                task_id = task["id"]

                if task_id in used_ids:
                    task_id = (
                        f"TASK-{sprint_index * 3 + task_index + 1:03d}"
                    )

                    suffix = 1
                    while task_id in used_ids:
                        suffix += 1
                        task_id = (
                            f"TASK-{sprint_index * 3 + task_index + 1:03d}"
                            f"-{suffix}"
                        )

                    task["id"] = task_id

                used_ids.add(task_id)

        data["sprints"] = normalized_sprints

        # Ensure the remaining arrays are valid.
        data["risks"] = self._string_list(
            data.get("risks", current_plan.get("risks", [])),
            "risks",
        )

        data["dependencies"] = self._string_list(
            data.get(
                "dependencies",
                current_plan.get("dependencies", []),
            ),
            "dependencies",
        )

        return data

    # --------------------------------------------------
    # GENERATE INITIAL DEVELOPMENT PLAN
    # --------------------------------------------------

    def generate_plan(self, requirements: dict) -> PlanningResponse:
        requirements_json = self._compact_json(requirements)

        prompt = f"""
You are the Planning Agent for DevSynapse.

Create a realistic development plan based only on these
requirements:
{requirements_json}

Return one JSON object only, with this schema:
{{
  "project_name": "string",
  "project_overview": "string",
  "estimated_timeline": "string",
  "development_phases": [
    {{
      "phase": "string",
      "description": "string",
      "estimated_duration": "string"
    }}
  ],
  "sprints": [
    {{
      "sprint_number": 1,
      "title": "string",
      "goal": "string",
      "estimated_duration": "string",
      "tasks": [
        {{
          "id": "TASK-001",
          "title": "string",
          "description": "string",
          "priority": "High",
          "estimated_hours": 8,
          "dependencies": []
        }}
      ]
    }}
  ],
  "risks": ["string"],
  "dependencies": ["string"]
}}

Rules:
- Exactly 3 phases, 3 sprints, and 3 tasks per sprint.
- Each phase, sprint, and task must be a JSON object, never a string.
- Use High, Medium, or Low priority.
- estimated_hours must be a positive integer.
- Every task ID must be unique.
- Include every required field and use JSON arrays.
- Return valid JSON only. No Markdown.
"""

        data = self.llm.generate_json(prompt)
        data = self._normalize_plan(data)

        print("\nNORMALIZED PLANNING DATA:\n")
        print(json.dumps(data, indent=2))

        return PlanningResponse(**data)

    # --------------------------------------------------
    # IDENTIFY WHICH OUTPUTS NEED TO CHANGE
    # --------------------------------------------------

    def identify_edit_scope(self, instructions: str) -> dict:
        prompt = f"""
Classify the user's requested edits.

USER INSTRUCTIONS:
{instructions}

Return only this JSON object:
{{
  "update_requirements": false,
  "update_plan": false
}}

Rules:
- Requirements means features, scope, constraints, or requirements.
- Plan means phases, sprints, tasks, priorities, estimates,
  task order, or task dependencies.
- If requirements change, set both fields to true.
- A plan-only edit must leave update_requirements false.
- If unclear, choose the most directly requested output.
- Return valid JSON only.
"""

        result = self.llm.generate_json(prompt)

        update_requirements = result.get("update_requirements")
        update_plan = result.get("update_plan")

        if not isinstance(update_requirements, bool):
            raise ValueError(
                "Edit classifier returned invalid update_requirements."
            )

        if not isinstance(update_plan, bool):
            raise ValueError(
                "Edit classifier returned invalid update_plan."
            )

        if update_requirements:
            update_plan = True

        if not update_requirements and not update_plan:
            raise ValueError(
                "Could not identify what to change. "
                "Please provide more specific instructions."
            )

        return {
            "update_requirements": update_requirements,
            "update_plan": update_plan,
        }

    # --------------------------------------------------
    # EDIT THE DEVELOPMENT PLAN
    # --------------------------------------------------

    def edit_plan(
        self,
        requirements: dict,
        current_plan: dict,
        edit_instructions: str,
    ) -> PlanningResponse:

        requirements_json = self._compact_json(requirements)
        current_plan_json = self._compact_json(current_plan)

        prompt = f"""
You are the Planning Agent for DevSynapse.

Update the existing development plan according to the user's
instructions. Preserve unaffected details. Use the updated
requirements as the source of truth.

REQUIREMENTS:
{requirements_json}

CURRENT PLAN:
{current_plan_json}

USER EDIT:
{edit_instructions}

Return one complete JSON object only, with this schema:
{{
  "project_name": "string",
  "project_overview": "string",
  "estimated_timeline": "string",
  "development_phases": [
    {{
      "phase": "string",
      "description": "string",
      "estimated_duration": "string"
    }}
  ],
  "sprints": [
    {{
      "sprint_number": 1,
      "title": "string",
      "goal": "string",
      "estimated_duration": "string",
      "tasks": [
        {{
          "id": "TASK-001",
          "title": "string",
          "description": "string",
          "priority": "High",
          "estimated_hours": 8,
          "dependencies": []
        }}
      ]
    }}
  ],
  "risks": ["string"],
  "dependencies": ["string"]
}}

Rules:
- Exactly 3 phases, 3 sprints, and 3 tasks per sprint.
- Every phase, sprint, and task must be a JSON object, never a string.
- Preserve unrelated information.
- Task IDs must be unique.
- Use High, Medium, or Low priority.
- estimated_hours must be a positive integer.
- Use arrays for risks, dependencies, and task dependencies.
- Return valid JSON only. No Markdown.
"""

        data = self.llm.generate_json(prompt)

        # Reuse existing sprint/task data if the model returns
        # empty strings or malformed entries.
        data = self._normalize_plan(
            data,
            current_plan=current_plan,
        )

        return PlanningResponse(**data)

    # --------------------------------------------------
    # EDIT REQUIREMENTS, PLAN, OR BOTH
    # --------------------------------------------------

    def edit(
        self,
        requirements: dict,
        current_plan: dict,
        edit_instructions: str,
    ) -> dict:

        if not edit_instructions or not edit_instructions.strip():
            raise ValueError("Edit instructions cannot be empty.")

        scope = self.identify_edit_scope(edit_instructions)

        updated_requirements = requirements
        updated_plan = current_plan
        changed_sections = []

        # Regenerate requirements only when requested.
        if scope["update_requirements"]:
            requirements_agent = RequirementsAgent()

            updated_requirements = (
                requirements_agent.regenerate(
                    current_requirements=requirements,
                    edit_instructions=edit_instructions.strip(),
                ).model_dump()
            )

            changed_sections.append("requirements")

        # Plan-only edits skip the Requirements Agent entirely.
        if scope["update_plan"]:
            updated_plan = self.edit_plan(
                requirements=updated_requirements,
                current_plan=current_plan,
                edit_instructions=edit_instructions.strip(),
            ).model_dump()

            changed_sections.append("planning")

        return {
            "requirements": updated_requirements,
            "planning": updated_plan,
            "changed_sections": changed_sections,
        }