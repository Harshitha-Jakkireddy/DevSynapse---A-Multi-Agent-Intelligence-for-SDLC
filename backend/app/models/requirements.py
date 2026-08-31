from pydantic import BaseModel
from typing import List


class FunctionalRequirement(BaseModel):
    id: str
    title: str
    description: str
    priority: str


class NonFunctionalRequirement(BaseModel):
    category: str
    description: str


class RequirementsResponse(BaseModel):
    project_name: str
    project_summary: str

    functional_requirements: List[FunctionalRequirement]

    non_functional_requirements: List[NonFunctionalRequirement]

    assumptions: List[str]

    out_of_scope: List[str]

    suggested_users: List[str]