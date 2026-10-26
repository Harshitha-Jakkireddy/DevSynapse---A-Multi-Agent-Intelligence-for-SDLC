
from typing import TypedDict

from langgraph.graph import StateGraph, START, END

from app.agents.requirements_agent import RequirementsAgent
from app.agents.planning_agent import PlanningAgent
from app.agents.architecture_agent import ArchitectureAgent
from app.agents.code_generation_agent import CodeGenerationAgent


class DevSynapseState(TypedDict, total=False):
    project_idea: str
    requirements: dict
    planning: dict
    architecture: dict
    code: dict


def analyze_requirements(state: DevSynapseState) -> dict:
    """Generate requirements from the project idea."""

    agent = RequirementsAgent()
    result = agent.analyze(state["project_idea"])

    return {
        "requirements": result.model_dump()
    }


def generate_planning(state: DevSynapseState) -> dict:
    """Generate a plan using the requirements."""

    agent = PlanningAgent()
    result = agent.generate_plan(state["requirements"])

    return {
        "planning": result.model_dump()
    }


def generate_architecture(state: DevSynapseState) -> dict:
    """Generate architecture using requirements and planning."""

    agent = ArchitectureAgent()
    result = agent.generate_architecture(
        state["requirements"],
        state["planning"],
    )

    return {
        "architecture": result.model_dump()
    }


def generate_code(state: DevSynapseState) -> dict:
    """Generate source files from the project artifacts."""

    agent = CodeGenerationAgent()

    result = agent.generate_code(
        requirements=state["requirements"],
        planning=state["planning"],
        architecture=state["architecture"],
    )

    return {
        "code": result.model_dump()
    }


def build_dev_synapse_graph():
    """Build and compile the sequential multi-agent workflow."""

    workflow = StateGraph(DevSynapseState)

    workflow.add_node("requirements", analyze_requirements)
    workflow.add_node("planning", generate_planning)
    workflow.add_node("architecture", generate_architecture)
    workflow.add_node("code_generation", generate_code)

    workflow.add_edge(START, "requirements")
    workflow.add_edge("requirements", "planning")
    workflow.add_edge("planning", "architecture")
    workflow.add_edge("architecture", "code_generation")
    workflow.add_edge("code_generation", END)

    return workflow.compile()
