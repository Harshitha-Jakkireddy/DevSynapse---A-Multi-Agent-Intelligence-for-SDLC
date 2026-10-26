
import json
import os

from dotenv import load_dotenv
from groq import BadRequestError
from langchain_groq import ChatGroq

load_dotenv()


class LLMService:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError(
                "GROQ_API_KEY is missing. Add it to your backend .env file."
            )

        self.model = os.getenv(
            "MODEL_NAME",
            "openai/gpt-oss-20b",
        )

        # Override in backend/.env if your selected model supports it.
        max_tokens = int(os.getenv("LLM_MAX_TOKENS", "8192"))

        self.llm = ChatGroq(
            api_key=api_key,
            model=self.model,
            temperature=0.2,
            max_tokens=max_tokens,
            max_retries=2,
        )

        self.json_llm = ChatGroq(
            api_key=api_key,
            model=self.model,
            temperature=0.1,
            max_tokens=max_tokens,
            max_retries=2,
        ).bind(
            response_format={"type": "json_object"}
        )

    @staticmethod
    def _get_text(response) -> str:
        """Extract text from a LangChain AIMessage."""

        content = response.content

        if isinstance(content, str):
            return content

        if isinstance(content, list):
            text_parts = []

            for block in content:
                if isinstance(block, str):
                    text_parts.append(block)
                elif isinstance(block, dict) and block.get("text"):
                    text_parts.append(block["text"])

            if text_parts:
                return "\n".join(text_parts)

        raise ValueError(
            "Expected a text response from the language model."
        )

    def generate(self, prompt: str) -> str:
        """Generate a regular text response."""

        response = self.llm.invoke(
            [
                (
                    "system",
                    "You are an expert AI software development agent. "
                    "Follow the requested output structure carefully. "
                    "Be concise and avoid unnecessary explanations.",
                ),
                ("human", prompt),
            ]
        )

        return self._get_text(response)

    def _invoke_json(self, messages) -> str:
        """Invoke the model in JSON mode, falling back if rejected."""

        try:
            response = self.json_llm.invoke(messages)
        except BadRequestError as exc:
            print(
                "Groq JSON mode failed. Retrying without JSON mode:",
                str(exc),
            )
            response = self.llm.invoke(messages)

        return self._get_text(response).strip()

    @staticmethod
    def _parse_json_object(content: str) -> dict:
        """Parse JSON and ensure the result is an object."""

        data = json.loads(content)

        if not isinstance(data, dict):
            raise ValueError("LLM response must be a JSON object.")

        return data

    def generate_json(self, prompt: str) -> dict:
        """
        Generate a JSON object.

        Attempts:
        1. Generate using JSON mode.
        2. If parsing fails, regenerate once using a concise repair prompt.

        The repair prompt does not resend the malformed generated code,
        which helps reduce prompt size for code-generation requests.
        """

        json_prompt = (
            prompt
            + "\n\nOUTPUT REQUIREMENTS:\n"
            + "Return exactly one complete, valid JSON object. "
            + "Use double quotes for JSON keys and string values. "
            + "Do not use Markdown or code fences. "
            + "Do not add text outside the JSON object. "
            + "Include the required fields. "
            + "Keep the output concise. "
            + "Escape newlines, quotes, and backslashes correctly "
            + "inside JSON strings. "
            + "Close every string, object, and array before finishing."
        )

        messages = [
            (
                "system",
                "You are an expert AI software development agent. "
                "Return exactly one complete, valid JSON object matching "
                "the requested structure. Do not return Markdown or "
                "explanations. Properly escape all JSON strings.",
            ),
            ("human", json_prompt),
        ]

        content = self._invoke_json(messages)

        try:
            return self._parse_json_object(content)

        except (json.JSONDecodeError, ValueError) as first_error:
            print(
                "Groq returned invalid JSON. "
                "Attempting one concise regeneration."
            )

            # Do not resend the potentially huge malformed codebase.
            repair_prompt = (
                "Your previous response was invalid JSON or incomplete.\n"
                "Regenerate the requested output from the original request.\n"
                "Do not copy an incomplete response.\n"
                "Preserve the required schema and include all required fields.\n"
                "Keep the output concise and complete.\n"
                "Return one valid JSON object only, without Markdown.\n\n"
                f"Original request:\n{json_prompt}"
            )

            repair_messages = [
                (
                    "system",
                    "Return exactly one complete, valid JSON object. "
                    "Follow the original requested schema. "
                    "Do not return Markdown or explanatory text.",
                ),
                ("human", repair_prompt),
            ]

            content = self._invoke_json(repair_messages)

            try:
                return self._parse_json_object(content)

            except (json.JSONDecodeError, ValueError) as second_error:
                if isinstance(second_error, json.JSONDecodeError):
                    error_position = second_error.pos
                    start = max(0, error_position - 150)
                    end = min(len(content), error_position + 150)
                    problem_area = content[start:end]
                else:
                    error_position = "N/A"
                    problem_area = content[:300]

                raise ValueError(
                    "Groq returned invalid JSON after regeneration.\n"
                    f"Initial error: {first_error}\n"
                    f"Final error: {second_error}\n"
                    f"Error position: {error_position}\n"
                    f"Response length: {len(content)} characters\n"
                    f"Problem area: {problem_area!r}\n"
                    f"Response ending: {content[-300:]!r}"
                ) from second_error
