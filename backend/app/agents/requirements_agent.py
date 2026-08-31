import json

from app.services.llm_service import LLMService
from app.models.requirements import RequirementsResponse


class RequirementsAgent:

    def __init__(self):
        self.llm = LLMService()

    def analyze(self, project_idea: str) -> RequirementsResponse:

        prompt = f"""
You are the Requirements Analysis Agent in a multi-agent
software development system called AgentDev.

Analyze the following software project idea:

PROJECT IDEA:
{project_idea}

Your task is to generate a Software Requirements Specification.

Return ONLY valid JSON in the following format:

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
            "category": "Security",
            "description": "string"
        }}
    ],

    "assumptions": [
        "string"
    ],

    "out_of_scope": [
        "string"
    ],

    "suggested_users": [
        "string"
    ]
}}

RULES:

1. Generate between 6 and 12 functional requirements.
2. Each requirement must have a unique ID.
3. Priority must be High, Medium, or Low.
4. Include realistic security and performance requirements.
5. Clearly identify assumptions.
6. Clearly define what is out of scope.
7. Do not include markdown.
8. Return only valid JSON.
"""

        response = self.llm.generate(prompt)

        data = json.loads(response)

        return RequirementsResponse(**data)