from pydantic import BaseModel
from typing import List, Optional


class Task(BaseModel):
    id: str
    title: str
    description: str
    priority: str
    estimated_hours: int
    dependencies: List[str] = []


class Sprint(BaseModel):
    sprint_number: int
    title: str
    goal: str
    estimated_duration: str
    tasks: List[Task]


class DevelopmentPhase(BaseModel):
    phase: str
    description: str
    estimated_duration: str


class PlanningResponse(BaseModel):
    project_name: str

    project_overview: str

    estimated_timeline: str

    development_phases: List[DevelopmentPhase]

    sprints: List[Sprint]

    risks: List[str]

    dependencies: List[str]