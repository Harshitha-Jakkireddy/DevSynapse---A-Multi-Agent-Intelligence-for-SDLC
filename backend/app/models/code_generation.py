
from pydantic import BaseModel, Field
from typing import List


class GeneratedFile(BaseModel):
    path: str
    language: str
    content: str


class CodeGenerationResponse(BaseModel):
    project_name: str

    files: List[GeneratedFile] = Field(
        default_factory=list
    )

    setup_instructions: List[str] = Field(
        default_factory=list
    )
