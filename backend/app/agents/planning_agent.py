import json

from app.services.llm_service import LLMService
from app.models.planning import PlanningResponse


class PlanningAgent:

    def __init__(self):
        self.llm = LLMService()

    def generate_plan(self, requirements: dict) -> PlanningResponse:

        requirements_json = json.dumps(
            requirements,
            indent=2
        )

        prompt = f"""
You are the Planning Agent in AgentDev, a multi-agent
AI software development system.

The Requirements Agent has already completed its analysis.

Your task is to create a realistic software development plan.

BASE YOUR PLAN ONLY ON THESE REQUIREMENTS:

{requirements_json}

IMPORTANT:
Return exactly ONE valid JSON object.

Do not return Markdown.
Do not use ```json.
Do not add explanations before or after JSON.

Use exactly this structure:

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

    "risks": [
        "string"
    ],

    "dependencies": [
        "string"
    ]
}}

VALIDATION RULES:

- Every sprint MUST be inside its own {{ }} object.
- Every task MUST be inside its own {{ }} object.
- Separate objects in arrays using commas.
- Generate exactly 3 development phases.
- Generate exactly 3 sprints.
- Generate 3 tasks per sprint.
- Priorities can only be: High, Medium, Low.
- estimated_hours must be an integer.
- All task IDs must be unique.
- Return ONLY the JSON object.
"""

        response = self.llm.generate(prompt)

        # Remove accidental markdown formatting
        response = response.strip()

        if response.startswith("```json"):
            response = response.replace("```json", "", 1)

        if response.startswith("```"):
            response = response.replace("```", "", 1)

        if response.endswith("```"):
            response = response[:-3]

        response = response.strip()

        print("\nRAW PLANNING RESPONSE:\n")
        print(response)

        data = json.loads(response)

        return PlanningResponse(**data)