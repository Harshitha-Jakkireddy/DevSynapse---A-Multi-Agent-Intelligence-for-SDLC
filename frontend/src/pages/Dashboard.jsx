import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectInput from "../components/ProjectInput";
import AgentPipeline from "../components/AgentPipeline";

import RequirementsView from "../components/RequirementsView";
import PlanningView from "../components/PlanningView";
import ArchitectureView from "../components/ArchitectureView";

import ApprovalPanel from "../components/ApprovalPanel";
import LoadingAgent from "../components/LoadingAgent";

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  // ==========================================
  // PROJECT IDEA
  // ==========================================

  const [projectIdea, setProjectIdea] = useState("");

  // ==========================================
  // AI GENERATED DATA
  // ==========================================

  const [requirementsData, setRequirementsData] = useState(null);
  const [planningData, setPlanningData] = useState(null);
  const [architectureData, setArchitectureData] = useState(null);

  // ==========================================
  // CURRENT ACTIVE TAB
  // ==========================================

  const [activeTab, setActiveTab] = useState(null);

  // ==========================================
  // AGENT STATUS
  // ==========================================

  const [agentStatus, setAgentStatus] = useState({
    requirements: "waiting",
    planning: "waiting",
    architecture: "waiting",
  });

  // ==========================================
  // APPROVAL STATUS
  // ==========================================

  const [approvedStages, setApprovedStages] = useState({
    requirements: false,
    planning: false,
    architecture: false,
  });

  // ==========================================
  // START PROJECT
  // REQUIREMENTS AGENT
  // ==========================================

  const handleStartProject = async () => {
    if (!projectIdea.trim()) {
      alert("Please describe your software project first.");
      return;
    }

    // Reset previous project data
    setRequirementsData(null);
    setPlanningData(null);
    setArchitectureData(null);

    // Reset workflow
    setAgentStatus({
      requirements: "running",
      planning: "waiting",
      architecture: "waiting",
    });

    setApprovedStages({
      requirements: false,
      planning: false,
      architecture: false,
    });

    // Open Requirements tab
    setActiveTab("requirements");

    try {
      const response = await fetch(
        `${API_URL}/api/requirements/analyze`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            project_idea: projectIdea,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to generate requirements"
        );
      }

      console.log("Requirements Agent Output:", result);

      // Save Requirements Agent output
      setRequirementsData(result.data);

      // Mark Requirements Agent completed
      setAgentStatus((prev) => ({
        ...prev,
        requirements: "completed",
      }));
    } catch (error) {
      console.error("Requirements Agent Error:", error);

      alert(
        error.message ||
          "Failed to connect to the Requirements Agent."
      );

      // Reset workflow on error
      setAgentStatus({
        requirements: "waiting",
        planning: "waiting",
        architecture: "waiting",
      });

      setActiveTab(null);
    }
  };

  // ==========================================
  // GENERATE PLANNING
  // PLANNING AGENT
  // ==========================================

  const generatePlanning = async () => {
    try {
      setPlanningData(null);

      const response = await fetch(
        `${API_URL}/api/planning/generate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            requirements: requirementsData,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to generate development plan"
        );
      }

      console.log("Planning Agent Output:", result);

      // Save Planning Agent output
      setPlanningData(result.data);

      // Mark Planning Agent completed
      setAgentStatus((prev) => ({
        ...prev,
        planning: "completed",
      }));
    } catch (error) {
      console.error("Planning Agent Error:", error);

      alert(
        error.message ||
          "Failed to generate the development plan."
      );

      // Reset Planning Agent status
      setAgentStatus((prev) => ({
        ...prev,
        planning: "waiting",
      }));

      // Return to Requirements
      setActiveTab("requirements");
    }
  };

  // ==========================================
  // GENERATE ARCHITECTURE
  // ARCHITECTURE AGENT
  // ==========================================

  const generateArchitecture = async () => {
    try {
      setArchitectureData(null);

      const response = await fetch(
        `${API_URL}/api/architecture/generate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            requirements: requirementsData,
            planning: planningData,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to generate architecture"
        );
      }

      console.log("Architecture Agent Output:", result);

      // Save Architecture Agent output
      setArchitectureData(result.data);

      // Mark Architecture Agent completed
      setAgentStatus((prev) => ({
        ...prev,
        architecture: "completed",
      }));
    } catch (error) {
      console.error("Architecture Agent Error:", error);

      alert(
        error.message ||
          "Failed to generate system architecture."
      );

      // Reset Architecture Agent status
      setAgentStatus((prev) => ({
        ...prev,
        architecture: "waiting",
      }));

      // Return to Planning
      setActiveTab("planning");
    }
  };

  // ==========================================
  // APPROVE CURRENT STAGE
  // ==========================================

  const handleApprove = async () => {
    // ------------------------------------------
    // APPROVE REQUIREMENTS
    // ------------------------------------------

    if (activeTab === "requirements") {
      // Mark Requirements as approved
      setApprovedStages((prev) => ({
        ...prev,
        requirements: true,
      }));

      // Start Planning Agent
      setAgentStatus((prev) => ({
        ...prev,
        planning: "running",
      }));

      // Switch to Planning tab
      setActiveTab("planning");

      // Generate REAL development plan
      await generatePlanning();

      return;
    }

    // ------------------------------------------
    // APPROVE PLANNING
    // ------------------------------------------

    if (activeTab === "planning") {
      // Mark Planning as approved
      setApprovedStages((prev) => ({
        ...prev,
        planning: true,
      }));

      // Start Architecture Agent
      setAgentStatus((prev) => ({
        ...prev,
        architecture: "running",
      }));

      // Switch to Architecture tab
      setActiveTab("architecture");

      // Generate REAL architecture
      await generateArchitecture();

      return;
    }

    // ------------------------------------------
    // APPROVE ARCHITECTURE
    // ------------------------------------------

    if (activeTab === "architecture") {
      setApprovedStages((prev) => ({
        ...prev,
        architecture: true,
      }));

      alert("🎉 Project planning workflow completed!");
    }
  };

  // ==========================================
  // EDIT HANDLER
  // ==========================================

  const handleEdit = () => {
    alert(
      `Edit functionality for ${activeTab} will be connected to AI regeneration later.`
    );
  };

  // ==========================================
  // RENDER AGENT CONTENT
  // ==========================================

  const renderContent = () => {
    if (!activeTab) {
      return null;
    }

    // Show loading animation
    if (agentStatus[activeTab] === "running") {
      const agentNames = {
        requirements: "Requirements Agent",
        planning: "Planning Agent",
        architecture: "Architecture Agent",
      };

      return (
        <LoadingAgent
          agentName={agentNames[activeTab]}
        />
      );
    }

    // Don't show content until completed
    if (agentStatus[activeTab] !== "completed") {
      return null;
    }

    // Render corresponding agent output
    switch (activeTab) {
      case "requirements":
        return (
          <RequirementsView
            data={requirementsData}
          />
        );

      case "planning":
        return (
          <PlanningView
            data={planningData}
          />
        );

      case "architecture":
        return (
          <ArchitectureView
            data={architectureData}
          />
        );

      default:
        return null;
    }
  };

  // ==========================================
  // WORKFLOW STATUS
  // ==========================================

  const isProjectStarted = activeTab !== null;

  const canShowApproval =
    activeTab &&
    agentStatus[activeTab] === "completed" &&
    !approvedStages[activeTab];

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="app">

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectStarted={isProjectStarted}
        agentStatus={agentStatus}
      />

      <main className="main-content">

        {/* HEADER */}
        <Header />

        {/* HERO SCREEN */}
        {!isProjectStarted && (
          <section className="hero">

            <h1>Build Software With AI Agents 🚀</h1>

            <p>
              AgentDev uses specialized AI agents to transform your software
              idea into structured requirements, a development plan, and a
              complete system architecture.
            </p>

            <ProjectInput
              projectIdea={projectIdea}
              setProjectIdea={setProjectIdea}
              onStart={handleStartProject}
            />

          </section>
        )}

        {/* AGENT PIPELINE */}
        {isProjectStarted && (
          <AgentPipeline
            agentStatus={agentStatus}
            activeTab={activeTab}
          />
        )}

        {/* WORKSPACE */}
        {isProjectStarted && (
          <section className="workspace">

            {/* TABS */}
            <div className="tabs">

              {/* REQUIREMENTS TAB */}
              {agentStatus.requirements !== "waiting" && (
                <button
                  className={`tab ${
                    activeTab === "requirements"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveTab("requirements")
                  }
                >
                  📋 Requirements
                </button>
              )}

              {/* PLANNING TAB */}
              {agentStatus.planning !== "waiting" && (
                <button
                  className={`tab ${
                    activeTab === "planning"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveTab("planning")
                  }
                >
                  📅 Planning
                </button>
              )}

              {/* ARCHITECTURE TAB */}
              {agentStatus.architecture !== "waiting" && (
                <button
                  className={`tab ${
                    activeTab === "architecture"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveTab("architecture")
                  }
                >
                  🏗 Architecture
                </button>
              )}

            </div>

            {/* CONTENT */}
            <div className="workspace-content">

              {renderContent()}

              {/* APPROVAL PANEL */}
              {canShowApproval && (
                <ApprovalPanel
                  activeTab={activeTab}
                  onApprove={handleApprove}
                  onEdit={handleEdit}
                />
              )}

              {/* WORKFLOW COMPLETE */}
              {approvedStages.architecture && (
                <div className="workflow-complete">

                  🎉 <strong>Workflow Completed!</strong>

                  <p>
                    Requirements, planning, and architecture have all been
                    generated and approved.
                  </p>

                </div>
              )}

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default Dashboard;