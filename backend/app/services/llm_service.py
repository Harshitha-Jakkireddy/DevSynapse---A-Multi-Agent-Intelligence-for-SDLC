import os
import json

from dotenv import load_dotenv
from groq import Groq

load_dotenv()


class LLMService:

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError(
                "GROQ_API_KEY is missing. Add it to your .env file."
            )

        self.client = Groq(api_key=api_key)

        self.model = os.getenv(
            "MODEL_NAME",
            "openai/gpt-oss-20b"
        )


    def generate(self, prompt: str) -> str:
        """
        Normal text generation.
        """

        response = self.client.chat.completions.create(
            model=self.model,

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert AI software development agent. "
                        "Follow the requested output structure carefully."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.2
        )

        return response.choices[0].message.content


    def generate_json(self, prompt: str) -> dict:
        """
        Generate and validate JSON output.
        """

        response = self.client.chat.completions.create(
            model=self.model,

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert AI software development agent. "
                        "You MUST return exactly one valid JSON object. "
                        "Do not return markdown. "
                        "Do not use code fences. "
                        "Do not add explanations before or after the JSON."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.1,

            response_format={
                "type": "json_object"
            }
        )

        content = response.choices[0].message.content

        return json.loads(content)