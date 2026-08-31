from pydantic import BaseModel, Field
from typing import List


class TechnologyStackItem(BaseModel):
    category: str
    name: str
    reason: str


class ArchitectureLayer(BaseModel):
    name: str
    description: str
    components: List[str] = Field(default_factory=list)


class SystemComponent(BaseModel):
    name: str
    responsibility: str
    technologies: List[str] = Field(default_factory=list)


class ArchitectureResponse(BaseModel):

    project_name: str

    architecture_style: str

    architecture_overview: str

    technology_stack: List[TechnologyStackItem] = Field(
        default_factory=list
    )

    architecture_layers: List[ArchitectureLayer] = Field(
        default_factory=list
    )

    system_components: List[SystemComponent] = Field(
        default_factory=list
    )

    # Optional/default fields to prevent crashes
    database_design_overview: str = (
        "Database design will be defined based on the system requirements."
    )

    api_design_overview: str = (
        "REST APIs will be designed to support communication between frontend and backend services."
    )

    folder_structure: List[str] = Field(
        default_factory=list
    )

    communication_flow: List[str] = Field(
        default_factory=list
    )