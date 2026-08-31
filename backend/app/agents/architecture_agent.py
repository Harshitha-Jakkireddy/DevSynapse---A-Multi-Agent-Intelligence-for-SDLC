import json

from app.services.llm_service import LLMService
from app.models.architecture import ArchitectureResponse


class ArchitectureAgent:

    def __init__(self):
        self.llm = LLMService()

    def generate_architecture(
        self,
        requirements: dict,
        planning: dict
    ) -> ArchitectureResponse:

        # Convert input data into readable JSON
        requirements_json = json.dumps(
            requirements,
            indent=2
        )

        planning_json = json.dumps(
            planning,
            indent=2
        )

        # Prompt for Architecture Agent
        prompt = f"""
You are an expert Software Architecture Agent in a multi-agent
software development system called AgentDev.

Your task is to design a practical software architecture based on the
provided software requirements and development plan.

========================
SOFTWARE REQUIREMENTS
========================

{requirements_json}

========================
DEVELOPMENT PLAN
========================

{planning_json}

========================
YOUR TASK
========================

Generate a complete architecture for this project.

The architecture must include:

1. Architecture style
2. Architecture overview
3. Technology stack
4. Architecture layers
5. System components
6. Database design overview
7. API design overview
8. Recommended folder structure
9. Communication flow

========================
IMPORTANT RULES
========================

- Base the architecture on the provided requirements.
- Base technology decisions on the project requirements.
- Generate practical choices suitable for a full-stack application.
- Keep descriptions concise and clear.
- Do not generate Mermaid diagrams.
- Avoid unnecessary technologies.
- Avoid overly complex solutions.

ARCHITECTURE DECISION RULES:

- Prefer a modular monolith architecture for small and medium-sized projects.
- Use microservices only when explicitly required by the software requirements.
- Keep the architecture practical and easy to implement.
- Prefer commonly used technologies.
- Do not introduce technologies that are unnecessary for the project.

========================
REQUIRED JSON STRUCTURE
========================

Return the result using exactly this JSON structure:

{{
  "project_name": "string",

  "architecture_style": "string",

  "architecture_overview": "string",

  "technology_stack": [
    {{
      "category": "string",
      "name": "string",
      "reason": "string"
    }}
  ],

  "architecture_layers": [
    {{
      "name": "string",
      "description": "string",
      "components": [
        "string"
      ]
    }}
  ],

  "system_components": [
    {{
      "name": "string",
      "responsibility": "string",
      "technologies": [
        "string"
      ]
    }}
  ],

  "database_design_overview": "string",

  "api_design_overview": "string",

  "folder_structure": [
    "string"
  ],

  "communication_flow": [
    "string"
  ]
}}

IMPORTANT:

Generate ALL fields listed above.

Do not skip:

- database_design_overview
- api_design_overview
- folder_structure
- communication_flow

Generate a realistic and practical architecture now.
"""

        try:
            # ==========================================
            # GENERATE STRUCTURED JSON USING THE LLM
            # ==========================================

            data = self.llm.generate_json(prompt)

            # ==========================================
            # FALLBACK VALUES
            # These prevent crashes if the LLM forgets
            # to generate some fields.
            # ==========================================

            data.setdefault(
                "database_design_overview",
                (
                    "A PostgreSQL relational database will store "
                    "application data using normalized tables and "
                    "appropriate relationships."
                )
            )

            data.setdefault(
                "api_design_overview",
                (
                    "RESTful APIs will handle communication between "
                    "the frontend and backend application."
                )
            )

            data.setdefault(
                "folder_structure",
                [
                    "frontend/",
                    "frontend/src/",
                    "frontend/src/components/",
                    "frontend/src/pages/",
                    "frontend/src/services/",
                    "backend/",
                    "backend/app/",
                    "backend/app/api/",
                    "backend/app/models/",
                    "backend/app/services/",
                    "backend/app/agents/",
                    "tests/"
                ]
            )

            data.setdefault(
                "communication_flow",
                [
                    "User interacts with the frontend application",
                    "Frontend sends HTTP requests to backend APIs",
                    "Backend validates and processes requests",
                    "Backend executes business logic",
                    "Backend communicates with the PostgreSQL database",
                    "Backend returns a response to the frontend",
                    "Frontend displays the result to the user"
                ]
            )

            # ==========================================
            # DEBUG OUTPUT
            # ==========================================

            print("\n" + "=" * 70)
            print("ARCHITECTURE AGENT OUTPUT")
            print("=" * 70)

            print(
                json.dumps(
                    data,
                    indent=2
                )
            )

            print("=" * 70 + "\n")

            # ==========================================
            # VALIDATE USING PYDANTIC
            # ==========================================

            return ArchitectureResponse(**data)

        except Exception as e:

            print("\n" + "=" * 70)
            print("ARCHITECTURE AGENT ERROR")
            print("=" * 70)

            print(str(e))

            print("=" * 70 + "\n")

            raise ValueError(
                f"Failed to generate valid architecture: {str(e)}"
            )