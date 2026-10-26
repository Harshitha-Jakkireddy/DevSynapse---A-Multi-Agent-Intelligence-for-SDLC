import json

from app.services.llm_service import LLMService
from app.models.requirements import RequirementsResponse


class RequirementsAgent:

    def __init__(self):
        self.llm = LLMService()

    # --------------------------------------------------
    # HELPERS
    # --------------------------------------------------

    @staticmethod
    def _compact_json(data):
        """Serialize JSON with minimal whitespace."""
        return json.dumps(
            data,
            ensure_ascii=False,
            separators=(",", ":"),
        )

    # --------------------------------------------------
    # ANALYZE INITIAL PROJECT IDEA
    # --------------------------------------------------

    def analyze(self, project_idea: str) -> RequirementsResponse:
        prompt = f"""
You are the Requirements Analysis Agent for DevSynapse.

Analyze this project idea:
{project_idea}

Return one JSON object with exactly these fields:
{{
  "project_name": "string",
  "project_summary": "string",
  "functional_requirements": [
    {{
      "id": "FR-001",
      "title": "string",
      "description": "string",
      "priority": "High"
    }}
  ],
  "non_functional_requirements": [
    {{
      "category": "string",
      "description": "string"
    }}
  ],
  "assumptions": ["string"],
  "out_of_scope": ["string"],
  "suggested_users": ["string"]
}}

Rules:
- Generate 6 to 10 functional requirements.
- Use unique IDs such as FR-001.
- Priority must be High, Medium, or Low.
- Include realistic security and performance requirements.
- Keep descriptions concise.
- Include every field.
- Return valid JSON only, without Markdown.
"""

        data = self.llm.generate_json(prompt)
        data = self._normalize_requirements(data)

        return RequirementsResponse(**data)

    # --------------------------------------------------
    # REGENERATE REQUIREMENTS
    # --------------------------------------------------

    def regenerate(
        self,
        current_requirements: dict,
        edit_instructions: str,
    ) -> RequirementsResponse:

        if not edit_instructions or not edit_instructions.strip():
            raise ValueError(
                "Requirements edit instructions cannot be empty."
            )

        requirements_json = self._compact_json(
            current_requirements
        )

        prompt = f"""
You are the Requirements Agent for DevSynapse.

Apply the user's requested changes to the existing requirements.

CURRENT REQUIREMENTS:
{requirements_json}

USER EDIT:
{edit_instructions.strip()}

Return a JSON object containing ONLY the fields that need to
change. Do not repeat unchanged fields.

Allowed fields:
- project_name: string
- project_summary: string
- functional_requirements: array of objects containing
  id, title, description, priority
- non_functional_requirements: array of objects containing
  category, description
- assumptions: array of strings
- out_of_scope: array of strings
- suggested_users: array of strings

Rules:
- Preserve unrelated information.
- If changing a list, return the complete updated list.
- Do not return partial list entries.
- Functional requirement IDs must be unique.
- Priority must be High, Medium, or Low.
- Do not invent changes unrelated to the user's request.
- Return at least one changed field.
- Return valid JSON only, without Markdown.
"""

        generated_data = self.llm.generate_json(prompt)

        if not isinstance(generated_data, dict):
            raise ValueError(
                "Requirements Agent must return a JSON object."
            )

        allowed_fields = {
            "project_name",
            "project_summary",
            "functional_requirements",
            "non_functional_requirements",
            "assumptions",
            "out_of_scope",
            "suggested_users",
        }

        unknown_fields = set(generated_data) - allowed_fields

        if unknown_fields:
            raise ValueError(
                "Requirements Agent returned unexpected fields: "
                + ", ".join(sorted(unknown_fields))
            )

        if not generated_data:
            raise ValueError(
                "Requirements Agent did not return any changes."
            )

        # Merge the changed fields with the existing requirements.
        # Unchanged fields remain intact.
        merged_data = {
            **current_requirements,
            **generated_data,
        }

        merged_data = self._normalize_requirements(merged_data)

        return RequirementsResponse(**merged_data)

    # --------------------------------------------------
    # NORMALIZE AND VALIDATE REQUIREMENTS
    # --------------------------------------------------

    @staticmethod
    def _normalize_requirements(data: dict) -> dict:

        if not isinstance(data, dict):
            raise ValueError(
                "Requirements response must be a JSON object."
            )

        result = dict(data)

        list_fields = [
            "functional_requirements",
            "non_functional_requirements",
            "assumptions",
            "out_of_scope",
            "suggested_users",
        ]

        for field in list_fields:
            if field not in result or result[field] is None:
                result[field] = []

            if not isinstance(result[field], list):
                raise ValueError(
                    f"'{field}' must be a JSON array."
                )

        # Normalize functional requirements.
        normalized_frs = []
        used_ids = set()

        for index, item in enumerate(
            result["functional_requirements"]
        ):
            if not isinstance(item, dict):
                raise ValueError(
                    f"Functional requirement {index + 1} "
                    "must be an object."
                )

            requirement = dict(item)

            title = str(
                requirement.get("title", "")
            ).strip()

            description = str(
                requirement.get("description", "")
            ).strip()

            if not title and description:
                title = description.split(".")[0].strip()

                if len(title) > 80:
                    title = " ".join(title.split()[:8]) + "..."

            if not title:
                raise ValueError(
                    f"Functional requirement {index + 1} "
                    "must have a title."
                )

            if not description:
                raise ValueError(
                    f"Functional requirement {index + 1} "
                    "must have a description."
                )

            priority = str(
                requirement.get("priority", "Medium")
            ).strip().capitalize()

            if priority not in {"High", "Medium", "Low"}:
                priority = "Medium"

            requirement_id = str(
                requirement.get("id", "")
            ).strip()

            if not requirement_id:
                requirement_id = f"FR-{index + 1:03d}"

            # Repair duplicate IDs.
            if requirement_id in used_ids:
                suffix = index + 1
                requirement_id = f"FR-{suffix:03d}"

                while requirement_id in used_ids:
                    suffix += 1
                    requirement_id = f"FR-{suffix:03d}"

            used_ids.add(requirement_id)

            normalized_frs.append({
                "id": requirement_id,
                "title": title,
                "description": description,
                "priority": priority,
            })

        result["functional_requirements"] = normalized_frs

        # Normalize non-functional requirements.
        normalized_nfrs = []

        for index, item in enumerate(
            result["non_functional_requirements"]
        ):
            if not isinstance(item, dict):
                raise ValueError(
                    f"Non-functional requirement {index + 1} "
                    "must be an object."
                )

            category = str(
                item.get("category", "")
            ).strip()

            description = str(
                item.get("description", "")
            ).strip()

            if not category or not description:
                raise ValueError(
                    f"Non-functional requirement {index + 1} "
                    "must contain category and description."
                )

            normalized_nfrs.append({
                "category": category,
                "description": description,
            })

        result["non_functional_requirements"] = normalized_nfrs

        # Normalize string arrays.
        for field in (
            "assumptions",
            "out_of_scope",
            "suggested_users",
        ):
            normalized_values = []

            for item in result[field]:
                if isinstance(item, str) and item.strip():
                    normalized_values.append(item.strip())
                elif isinstance(item, dict):
                    raise ValueError(
                        f"'{field}' must contain strings, "
                        "not objects."
                    )

            result[field] = normalized_values

        # Validate required top-level strings.
        for field in ("project_name", "project_summary"):
            value = result.get(field)

            if not isinstance(value, str) or not value.strip():
                raise ValueError(
                    f"'{field}' must be a non-empty string."
                )

            result[field] = value.strip()

        return result