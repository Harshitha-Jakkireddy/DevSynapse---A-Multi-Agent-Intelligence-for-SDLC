
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import traceback

from app.agents.requirements_agent import RequirementsAgent
from app.agents.planning_agent import PlanningAgent
from app.agents.architecture_agent import ArchitectureAgent

from app.agents.code_generation_agent import CodeGenerationAgent
from app.workflows.devsynapse_graph import build_dev_synapse_graph


app = FastAPI(
    title="AgentDev API",
    description="Multi-Agent AI Software Development Platform",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- REQUEST MODELS ----------------

class ProjectRequest(BaseModel):
    project_idea: str


class PlanningRequest(BaseModel):
    requirements: dict


class ArchitectureRequest(BaseModel):
    requirements: dict
    planning: dict


class RequirementsEditRequest(BaseModel):
    current_requirements: dict
    edit_instructions: str

class PlanningEditRequest(BaseModel):
    current_requirements: dict
    current_planning: dict
    edit_instructions: str


class CodeGenerationRequest(BaseModel):
    requirements: dict
    planning: dict
    architecture: dict



# ---------------- WORKFLOW ----------------

# Build the graph once when the application starts.
devsynapse_graph = build_dev_synapse_graph()


# ---------------- BASIC ENDPOINTS ----------------

@app.get("/")
def home():
    return {"message": "AgentDev Backend is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


# ---------------- REQUIREMENTS ----------------

@app.post("/api/requirements/analyze")
def analyze_requirements(request: ProjectRequest):
    try:
        agent = RequirementsAgent()
        result = agent.analyze(request.project_idea)

        return {
            "success": True,
            "data": result.model_dump(),
        }

    except Exception as e:
        print("REQUIREMENTS ERROR:", repr(e))
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze requirements.",
        )


@app.post("/api/requirements/regenerate")
def regenerate_requirements(request: RequirementsEditRequest):
    try:
        if not request.edit_instructions.strip():
            raise HTTPException(
                status_code=400,
                detail="Edit instructions cannot be empty.",
            )

        agent = RequirementsAgent()

        result = agent.regenerate(
            request.current_requirements,
            request.edit_instructions,
        )

        return {
            "success": True,
            "message": "Requirements regenerated successfully.",
            "data": result.model_dump(),
        }

    except HTTPException:
        raise

    except Exception as e:
        print("REQUIREMENTS REGENERATION ERROR:", repr(e))
        traceback.print_exc()

        # Keep detailed errors in the server log, not the API response.
        raise HTTPException(
            status_code=500,
            detail=(
                "Requirements regeneration failed. "
                "Check the backend terminal for the traceback."
            ),
        )


# ---------------- PLANNING ----------------

@app.post("/api/planning/generate")
def generate_planning(request: PlanningRequest):
    try:
        agent = PlanningAgent()
        result = agent.generate_plan(request.requirements)

        return {
            "success": True,
            "data": result.model_dump(),
        }

    except Exception as e:
        print("PLANNING ERROR:", repr(e))
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Failed to generate the development plan.",
        )


# ---------------- ARCHITECTURE ----------------

@app.post("/api/architecture/generate")
def generate_architecture(request: ArchitectureRequest):
    try:
        agent = ArchitectureAgent()

        result = agent.generate_architecture(
            request.requirements,
            request.planning,
        )

        return {
            "success": True,
            "data": result.model_dump(),
        }

    except Exception as e:
        print("ARCHITECTURE ERROR:", repr(e))
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Failed to generate architecture.",
        )


# ---------------- COMPLETE WORKFLOW ----------------

@app.post("/api/workflow/generate")
def generate_complete_workflow(request: ProjectRequest):
    try:
        result = devsynapse_graph.invoke({
            "project_idea": request.project_idea,
        })

        return {
            "success": True,
            "message": "Complete workflow executed successfully",
            "data": {
                "requirements": result["requirements"],
                "planning": result["planning"],
                "architecture": result["architecture"],
            },
        }

    except Exception as e:
        print("WORKFLOW ERROR:", repr(e))
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Workflow execution failed. Check the backend terminal.",
        )


@app.post("/api/planning/edit")
def edit_planning(request: PlanningEditRequest):
    try:
        if not request.edit_instructions.strip():
            raise HTTPException(
                status_code=400,
                detail="Edit instructions cannot be empty.",
            )

        agent = PlanningAgent()

        result = agent.edit(
            requirements=request.current_requirements,
            current_plan=request.current_planning,
            edit_instructions=request.edit_instructions,
        )

        return {
            "success": True,
            "message": "Planning edit completed successfully.",
            "data": result,
        }

    except HTTPException:
        raise

    except Exception as e:
        print("PLANNING EDIT ERROR:", repr(e))
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Planning edit failed. Check the backend terminal.",
        )



@app.post("/api/code/generate")
def generate_code(request: CodeGenerationRequest):
    try:
        agent = CodeGenerationAgent()

        result = agent.generate_code(
            requirements=request.requirements,
            planning=request.planning,
            architecture=request.architecture,
        )

        return {
            "success": True,
            "data": result.model_dump(),
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception as e:
        print("Code generation failed:")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Failed to generate project code.",
        )
