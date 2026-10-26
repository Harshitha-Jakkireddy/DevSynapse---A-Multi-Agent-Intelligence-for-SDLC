
import json
import re
from typing import Any, Dict, List

from app.services.llm_service import LLMService
from app.models.code_generation import (
    CodeGenerationResponse,
)


class CodeGenerationAgent:
    """
    Generates a coherent starter codebase from approved
    requirements, planning, and architecture.
    """

    MAX_FILES = 4
    MAX_PATH_LENGTH = 200
    MAX_SETUP_INSTRUCTIONS = 10

    def __init__(self):
        self.llm_service = LLMService()

    def generate_code(
        self,
        requirements: Dict[str, Any],
        planning: Dict[str, Any],
        architecture: Dict[str, Any],
    ) -> CodeGenerationResponse:
        """Generate and validate a starter codebase."""

        self._validate_inputs(
            requirements=requirements,
            planning=planning,
            architecture=architecture,
        )

        context = self._build_context(
            requirements=requirements,
            planning=planning,
            architecture=architecture,
        )

        prompt = self._build_prompt(context)

        result = self.llm_service.generate_json(prompt)

        if not isinstance(result, dict):
            raise ValueError(
                "The LLM returned an invalid code generation response."
            )

        normalized_result = self._normalize_response(result)

        return CodeGenerationResponse.model_validate(normalized_result)

    def _validate_inputs(
        self,
        requirements: Dict[str, Any],
        planning: Dict[str, Any],
        architecture: Dict[str, Any],
    ) -> None:
        """Ensure that all required project inputs are provided."""

        if not isinstance(requirements, dict) or not requirements:
            raise ValueError(
                "Valid project requirements are required."
            )

        if not isinstance(planning, dict) or not planning:
            raise ValueError(
                "A valid development plan is required."
            )

        if not isinstance(architecture, dict) or not architecture:
            raise ValueError(
                "A valid system architecture is required."
            )

    @staticmethod
    def _limit_items(value: Any, limit: int) -> Any:
        """Limit list context without accidentally slicing strings."""

        if isinstance(value, list):
            return value[:limit]

        return value

    def _build_context(
        self,
        requirements: Dict[str, Any],
        planning: Dict[str, Any],
        architecture: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Keep only the most relevant information for code generation."""

        requirement_context = {
            "project_name": requirements.get(
                "project_name", "Generated Project"
            ),
            "project_summary": requirements.get(
                "project_summary", ""
            ),
            "functional_requirements": self._limit_items(
                requirements.get("functional_requirements", []), 8
            ),
            "non_functional_requirements": self._limit_items(
                requirements.get("non_functional_requirements", []), 5
            ),
            "assumptions": self._limit_items(
                requirements.get("assumptions", []), 4
            ),
            "out_of_scope": self._limit_items(
                requirements.get("out_of_scope", []), 4
            ),
        }

        planning_context = {
            "project_overview": planning.get(
                "project_overview", ""
            ),
            "development_phases": self._limit_items(
                planning.get("development_phases", []), 3
            ),
            "dependencies": self._limit_items(
                planning.get("dependencies", []), 5
            ),
        }

        architecture_context = {
            "architecture_style": architecture.get(
                "architecture_style", ""
            ),
            "architecture_overview": architecture.get(
                "architecture_overview", ""
            ),
            "technology_stack": self._limit_items(
                architecture.get("technology_stack", []), 8
            ),
            "architecture_layers": self._limit_items(
                architecture.get("architecture_layers", []), 6
            ),
            "system_components": self._limit_items(
                architecture.get("system_components", []), 6
            ),
            "database_design_overview": architecture.get(
                "database_design_overview", ""
            ),
            "api_design_overview": architecture.get(
                "api_design_overview", ""
            ),
            "folder_structure": self._limit_items(
                architecture.get("folder_structure", []), 10
            ),
            "communication_flow": self._limit_items(
                architecture.get("communication_flow", []), 5
            ),
        }

        return {
            "requirements": requirement_context,
            "planning": planning_context,
            "architecture": architecture_context,
        }

    def _build_prompt(
        self,
        context: Dict[str, Any],
    ) -> str:
        """Build a concise prompt for generating a usable starter project."""

        context_json = json.dumps(
            context,
            ensure_ascii=False,
        )

        return f"""
You are the Code Generation Agent in DevSynapse.

Generate a small, coherent starter codebase using the approved
project requirements, development plan, and architecture.

PROJECT CONTEXT:
{context_json}

REQUIREMENTS:

1. Generate at most {self.MAX_FILES} files.
2. Prefer a few complete, compatible files over many incomplete files.
3. Follow the technology stack and architecture in the project context.
4. Implement the most important functional requirements first.
5. Keep imports, class names, methods, and interfaces consistent.
6. Include the application entry point where appropriate.
7. Include a dependency or configuration file when useful.
8. Include necessary input validation and error handling.
9. Never invent credentials, private keys, or secret tokens.
10. Use environment variables or clearly marked placeholders for secrets.
11. Do not claim the generated code was executed or tested.
12. File contents must contain actual source code or configuration.
13. Do not wrap source files in Markdown code fences.
14. Use relative file paths only.
15. Never use absolute paths or parent-directory traversal.
16. Do not generate duplicate file paths.
17. Keep implementations concise and complete.
18. Ensure the entire response is valid, complete JSON.
19. Properly escape quotes, backslashes, and newlines in JSON strings.
20. Do not add explanatory text outside the JSON object.

Return exactly one JSON object with this structure:

{{
  "project_name": "Project Name",
  "files": [
    {{
      "path": "relative/path/to/file",
      "language": "python",
      "content": "complete source code"
    }}
  ],
  "setup_instructions": [
    "A concise setup instruction"
  ]
}}

Return valid JSON only. Do not include Markdown fences.
"""

    def _normalize_response(
        self,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Normalize generated files and reject unsafe paths."""

        project_name = data.get(
            "project_name", "Generated Project"
        )

        if (
            not isinstance(project_name, str)
            or not project_name.strip()
        ):
            project_name = "Generated Project"

        raw_files = data.get("files", [])

        if not isinstance(raw_files, list):
            raise ValueError(
                "The generated response must contain a files list."
            )

        files: List[Dict[str, str]] = []
        seen_paths = set()

        for item in raw_files:
            if not isinstance(item, dict):
                continue

            path = item.get("path")
            language = item.get("language", "text")
            content = item.get("content")

            if not isinstance(path, str):
                continue

            if not isinstance(content, str):
                continue

            path = path.strip().replace("\\", "/")

            if not isinstance(language, str):
                language = "text"
            else:
                language = language.strip() or "text"

            if not self._is_safe_relative_path(path):
                continue

            if len(path) > self.MAX_PATH_LENGTH:
                continue

            if path in seen_paths:
                continue

            if not content.strip():
                continue

            seen_paths.add(path)

            files.append(
                {
                    "path": path,
                    "language": language,
                    "content": content,
                }
            )

            if len(files) >= self.MAX_FILES:
                break

        if not files:
            raise ValueError(
                "The LLM did not generate any valid source files. "
                "Please try generating the code again."
            )

        raw_instructions = data.get("setup_instructions", [])

        if not isinstance(raw_instructions, list):
            raw_instructions = []

        instructions = []

        for instruction in raw_instructions:
            if isinstance(instruction, str) and instruction.strip():
                instructions.append(instruction.strip())

            if len(instructions) >= self.MAX_SETUP_INSTRUCTIONS:
                break

        return {
            "project_name": project_name.strip(),
            "files": files,
            "setup_instructions": instructions,
        }

    @staticmethod
    def _is_safe_relative_path(path: str) -> bool:
        """
        Reject absolute paths, traversal, and invalid path segments.

        This validates generated paths. It does not write or execute
        the generated files.
        """

        if not path or "\x00" in path:
            return False

        if path.startswith("/"):
            return False

        if re.match(r"^[a-zA-Z]:", path):
            return False

        parts = path.split("/")

        if any(part in ("", ".", "..") for part in parts):
            return False

        return True
