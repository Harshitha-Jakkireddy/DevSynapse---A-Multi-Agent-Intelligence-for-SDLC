from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from app.agents.requirements_agent import RequirementsAgent
from app.agents.planning_agent import PlanningAgent
from app.agents.architecture_agent import ArchitectureAgent


app = FastAPI(
    title="AgentDev API",
    description="Multi-Agent AI Software Development Platform",
    version="1.0.0"
)


# Allow React frontend to communicate with FastAPI

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProjectRequest(BaseModel):
    project_idea: str

class PlanningRequest(BaseModel):
    requirements: dict

class ArchitectureRequest(BaseModel):
    requirements: dict
    planning: dict


@app.get("/")
def home():
    return {
        "message": "AgentDev Backend is running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/api/requirements/analyze")
def analyze_requirements(request: ProjectRequest):

    try:

        agent = RequirementsAgent()

        result = agent.analyze(
            request.project_idea
        )

        return {
            "success": True,
            "data": result.model_dump()
        }

    except Exception as e:

        print("ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/api/planning/generate")
def generate_planning(request: PlanningRequest):

    try:
        agent = PlanningAgent()

        result = agent.generate_plan(
            request.requirements
        )

        return {
            "success": True,
            "data": result.model_dump()
        }

    except Exception as e:

        print("PLANNING ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/api/architecture/generate")
def generate_architecture(request: ArchitectureRequest):

    try:
        agent = ArchitectureAgent()

        result = agent.generate_architecture(
            request.requirements,
            request.planning
        )

        return {
            "success": True,
            "data": result.model_dump()
        }

    except Exception as e:

        print("ARCHITECTURE ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )