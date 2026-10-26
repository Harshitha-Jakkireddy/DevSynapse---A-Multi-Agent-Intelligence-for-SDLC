import "../App.css";
import { useState } from "react";
import {
  Code2,
  FileCode2,
  Copy,
  Check,
  Download,
  Folder,
  Terminal,
} from "lucide-react";

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
  // PROJECT IDEA
  const [projectIdea, setProjectIdea] = useState("");

  // GENERATED DATA
  const [requirementsData, setRequirementsData] = useState(null);
  const [planningData, setPlanningData] = useState(null);
  const [architectureData, setArchitectureData] = useState(null);
  const [codeData, setCodeData] = useState(null);

  // CODE VIEWER
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // REQUIREMENTS EDITING
  const [isEditing, setIsEditing] = useState(false);
  const [editInstructions, setEditInstructions] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  // PLANNING EDITING
  const [isEditingPlanning, setIsEditingPlanning] = useState(false);
  const [planningEditInstructions, setPlanningEditInstructions] =
    useState("");
  const [isRegeneratingPlanning, setIsRegeneratingPlanning] =
    useState(false);

  // ACTIVE TAB
  const [activeTab, setActiveTab] = useState(null);

  // AGENT STATUS
  const [agentStatus, setAgentStatus] = useState({
    requirements: "waiting",
    planning: "waiting",
    architecture: "waiting",
    code_generation: "waiting",
  });

  // APPROVAL STATUS
  const [approvedStages, setApprovedStages] = useState({
    requirements: false,
    planning: false,
    architecture: false,
  });

  // RESET GENERATED CODE WHEN UPSTREAM DATA CHANGES
  const resetCodeGeneration = () => {
    setCodeData(null);
    setSelectedFileIndex(0);
    setCopiedCode(false);

    setAgentStatus((prev) => ({
      ...prev,
      code_generation: "waiting",
    }));
  };

  // START PROJECT
  const handleStartProject = async () => {
    if (!projectIdea.trim()) {
      alert("Please describe your software project first.");
      return;
    }

    setRequirementsData(null);
    setPlanningData(null);
    setArchitectureData(null);
    setCodeData(null);
    setSelectedFileIndex(0);
    setCopiedCode(false);

    setIsEditing(false);
    setEditInstructions("");
    setIsRegenerating(false);

    setIsEditingPlanning(false);
    setPlanningEditInstructions("");
    setIsRegeneratingPlanning(false);

    setAgentStatus({
      requirements: "running",
      planning: "waiting",
      architecture: "waiting",
      code_generation: "waiting",
    });

    setApprovedStages({
      requirements: false,
      planning: false,
      architecture: false,
    });

    setActiveTab("requirements");

    try {
      const response = await fetch(
        `${API_URL}/api/requirements/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_idea: projectIdea,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "Failed to generate requirements."
        );
      }

      if (!result.success || !result.data) {
        throw new Error("Invalid requirements response from server.");
      }

      setRequirementsData(result.data);

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

      setAgentStatus({
        requirements: "waiting",
        planning: "waiting",
        architecture: "waiting",
        code_generation: "waiting",
      });

      setActiveTab(null);
    }
  };

  // GENERATE PLANNING
  const generatePlanning = async () => {
    try {
      setPlanningData(null);
      setArchitectureData(null);
      resetCodeGeneration();

      const response = await fetch(
        `${API_URL}/api/planning/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requirements: requirementsData,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "Failed to generate development plan."
        );
      }

      if (!result.success || !result.data) {
        throw new Error("Invalid planning response from server.");
      }

      setPlanningData(result.data);

      setAgentStatus((prev) => ({
        ...prev,
        planning: "completed",
        architecture: "waiting",
        code_generation: "waiting",
      }));

      setApprovedStages((prev) => ({
        ...prev,
        planning: false,
        architecture: false,
      }));
    } catch (error) {
      console.error("Planning Agent Error:", error);

      alert(
        error.message ||
          "Failed to generate the development plan."
      );

      setAgentStatus((prev) => ({
        ...prev,
        planning: "waiting",
      }));

      setActiveTab("requirements");
    }
  };

  // GENERATE ARCHITECTURE
  const generateArchitecture = async () => {
    try {
      setArchitectureData(null);
      resetCodeGeneration();

      const response = await fetch(
        `${API_URL}/api/architecture/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requirements: requirementsData,
            planning: planningData,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "Failed to generate architecture."
        );
      }

      if (!result.success || !result.data) {
        throw new Error("Invalid architecture response from server.");
      }

      setArchitectureData(result.data);

      setAgentStatus((prev) => ({
        ...prev,
        architecture: "completed",
        code_generation: "waiting",
      }));
    } catch (error) {
      console.error("Architecture Agent Error:", error);

      alert(
        error.message ||
          "Failed to generate system architecture."
      );

      setAgentStatus((prev) => ({
        ...prev,
        architecture: "waiting",
      }));

      setActiveTab("planning");
    }
  };

  // GENERATE CODE
  const generateCode = async () => {
    if (!requirementsData || !planningData || !architectureData) {
      alert(
        "Requirements, planning, and architecture must be available before generating code."
      );
      return;
    }

    setCodeData(null);
    setSelectedFileIndex(0);
    setCopiedCode(false);

    setAgentStatus((prev) => ({
      ...prev,
      code_generation: "running",
    }));

    setActiveTab("code_generation");

    try {
      const response = await fetch(
        `${API_URL}/api/code/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requirements: requirementsData,
            planning: planningData,
            architecture: architectureData,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "Failed to generate project code."
        );
      }

      if (
        !result.success ||
        !result.data ||
        !Array.isArray(result.data.files)
      ) {
        throw new Error(
          "The server returned an invalid code generation response."
        );
      }

      setCodeData(result.data);

      setAgentStatus((prev) => ({
        ...prev,
        code_generation: "completed",
      }));
    } catch (error) {
      console.error("Code Generation Agent Error:", error);

      alert(
        error.message ||
          "Failed to generate project code. Check the backend logs."
      );

      setAgentStatus((prev) => ({
        ...prev,
        code_generation: "waiting",
      }));

      setActiveTab("architecture");
    }
  };

  // APPROVE CURRENT STAGE
  const handleApprove = async () => {
    if (activeTab === "requirements") {
      setApprovedStages((prev) => ({
        ...prev,
        requirements: true,
      }));

      setAgentStatus((prev) => ({
        ...prev,
        planning: "running",
      }));

      setActiveTab("planning");
      await generatePlanning();
      return;
    }

    if (activeTab === "planning") {
      setApprovedStages((prev) => ({
        ...prev,
        planning: true,
      }));

      setAgentStatus((prev) => ({
        ...prev,
        architecture: "running",
      }));

      setActiveTab("architecture");
      await generateArchitecture();
      return;
    }

    if (activeTab === "architecture") {
      setApprovedStages((prev) => ({
        ...prev,
        architecture: true,
      }));

      await generateCode();
    }
  };

  // OPEN EDITOR
  const handleEdit = () => {
    if (activeTab === "requirements") {
      setEditInstructions("");
      setIsEditing(true);
      return;
    }

    if (activeTab === "planning") {
      setPlanningEditInstructions("");
      setIsEditingPlanning(true);
      return;
    }

    if (activeTab === "architecture") {
      alert("Architecture editing will be connected later.");
    }
  };

  // REGENERATE REQUIREMENTS
  const handleRegenerate = async (event) => {
    event.preventDefault();

    if (!editInstructions.trim()) {
      alert("Please enter your editing instructions.");
      return;
    }

    if (!requirementsData) {
      alert("No requirements are available to edit.");
      return;
    }

    setIsRegenerating(true);

    try {
      const response = await fetch(
        `${API_URL}/api/requirements/regenerate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_requirements: requirementsData,
            edit_instructions: editInstructions.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "Failed to regenerate requirements."
        );
      }

      if (!result.success || !result.data) {
        throw new Error(
          "The server returned an invalid requirements response."
        );
      }

      setRequirementsData(result.data);
      setPlanningData(null);
      setArchitectureData(null);
      resetCodeGeneration();

      setAgentStatus((prev) => ({
        ...prev,
        requirements: "completed",
        planning: "waiting",
        architecture: "waiting",
      }));

      setApprovedStages({
        requirements: false,
        planning: false,
        architecture: false,
      });

      setIsEditing(false);
      setEditInstructions("");

      setActiveTab("requirements");

      alert(
        "Requirements updated. Please approve them to generate a new plan."
      );
    } catch (error) {
      console.error("Requirements Regeneration Error:", error);

      alert(
        error.message ||
          "Failed to regenerate requirements. Please try again."
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  // REGENERATE PLANNING
  const handleRegeneratePlanning = async (event) => {
    event.preventDefault();

    if (!planningEditInstructions.trim()) {
      alert("Please enter your editing instructions.");
      return;
    }

    if (!requirementsData || !planningData) {
      alert("Requirements and planning data must be available to edit.");
      return;
    }

    setIsRegeneratingPlanning(true);

    try {
      const response = await fetch(
        `${API_URL}/api/planning/edit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_requirements: requirementsData,
            current_planning: planningData,
            edit_instructions: planningEditInstructions.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "Failed to update the development plan."
        );
      }

      if (!result.success || !result.data?.planning) {
        throw new Error(
          "The server returned an invalid planning response."
        );
      }

      const updatedRequirements =
        result.data.requirements || requirementsData;

      const updatedPlanning = result.data.planning;

      const changedSections = Array.isArray(result.data.changed_sections)
        ? result.data.changed_sections
        : ["planning"];

      const requirementsChanged =
        changedSections.includes("requirements");

      setRequirementsData(updatedRequirements);
      setPlanningData(updatedPlanning);
      setArchitectureData(null);
      resetCodeGeneration();

      setAgentStatus((prev) => ({
        ...prev,
        requirements: "completed",
        planning: "completed",
        architecture: "waiting",
      }));

      setApprovedStages((prev) => ({
        ...prev,
        requirements: requirementsChanged ? false : prev.requirements,
        planning: false,
        architecture: false,
      }));

      setIsEditingPlanning(false);
      setPlanningEditInstructions("");

      if (requirementsChanged) {
        setActiveTab("requirements");
      } else {
        setActiveTab("planning");
      }

      alert(
        requirementsChanged
          ? "Requirements and planning updated. Review the updated requirements before proceeding."
          : "Planning updated successfully. Please review and approve the updated plan."
      );
    } catch (error) {
      console.error("Planning Edit Error:", error);

      alert(
        error.message ||
          "Failed to update the development plan. Please try again."
      );
    } finally {
      setIsRegeneratingPlanning(false);
    }
  };

  // COPY SELECTED FILE
  const handleCopyCode = async () => {
    const selectedFile = codeData?.files?.[selectedFileIndex];

    if (!selectedFile) return;

    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopiedCode(true);

      setTimeout(() => setCopiedCode(false), 1800);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Could not copy the code. Please select and copy it manually.");
    }
  };

  // DOWNLOAD SELECTED FILE
  const handleDownloadFile = () => {
    const selectedFile = codeData?.files?.[selectedFileIndex];

    if (!selectedFile) return;

    const blob = new Blob([selectedFile.content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = selectedFile.path.split("/").pop() || "generated-file.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  // CODE GENERATION VIEW
  const renderCodeGeneration = () => {
    const files = codeData?.files || [];
    const selectedFile = files[selectedFileIndex];

    return (
      <section className="code-generation-view">
        <div className="code-generation-heading">
          <div className="code-generation-heading-icon">
            <Code2 size={23} />
          </div>

          <div>
            <h2>{codeData?.project_name || "Generated Project Code"}</h2>
            <p>
              Browse the files generated from your approved architecture.
            </p>
          </div>
        </div>

        {files.length > 0 ? (
          <>
            <div className="generated-code-summary">
              <div>
                <FileCode2 size={18} />
                <span>{files.length} generated files</span>
              </div>

              <span className="generated-code-badge">
                Generation complete
              </span>
            </div>

            <div className="generated-code-browser">
              <aside className="generated-file-sidebar">
                <div className="generated-file-sidebar-title">
                  <Folder size={16} />
                  <span>PROJECT FILES</span>
                </div>

                {files.map((file, index) => (
                  <button
                    key={`${file.path}-${index}`}
                    type="button"
                    className={`generated-file-item ${
                      selectedFileIndex === index ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedFileIndex(index);
                      setCopiedCode(false);
                    }}
                    title={file.path}
                  >
                    <FileCode2 size={16} />
                    <span>{file.path}</span>
                  </button>
                ))}
              </aside>

              <div className="generated-code-main">
                {selectedFile && (
                  <>
                    <div className="generated-code-toolbar">
                      <div className="generated-code-file-title">
                        <FileCode2 size={17} />
                        <span>{selectedFile.path}</span>
                        <span className="generated-code-language">
                          {selectedFile.language}
                        </span>
                      </div>

                      <div className="generated-code-actions">
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          title="Copy file contents"
                        >
                          {copiedCode ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                          <span>{copiedCode ? "Copied" : "Copy"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDownloadFile}
                          title="Download this file"
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>

                    <pre className="generated-code-content">
                      <code>{selectedFile.content}</code>
                    </pre>
                  </>
                )}
              </div>
            </div>

            {Array.isArray(codeData.setup_instructions) &&
              codeData.setup_instructions.length > 0 && (
                <div className="generated-setup">
                  <h3>
                    <Terminal size={18} />
                    Setup Instructions
                  </h3>

                  <ol>
                    {codeData.setup_instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              )}

            <p className="generated-code-note">
              Review generated code before running it. Generated files are
              displayed for inspection and are not automatically executed.
            </p>
          </>
        ) : (
          <div className="generated-code-empty">
            <Code2 size={36} />
            <h3>No files were generated</h3>
            <p>
              Return to Architecture and try generating the code again.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => setActiveTab("architecture")}
            >
              Back to Architecture
            </button>
          </div>
        )}
      </section>
    );
  };

  // RENDER AGENT CONTENT
  const renderContent = () => {
    if (!activeTab) return null;

    if (agentStatus[activeTab] === "running") {
      const agentNames = {
        requirements: "Requirements Agent",
        planning: "Planning Agent",
        architecture: "Architecture Agent",
        code_generation: "Code Generation Agent",
      };

      return <LoadingAgent agentName={agentNames[activeTab]} />;
    }

    if (agentStatus[activeTab] !== "completed") {
      return null;
    }

    switch (activeTab) {
      case "requirements":
        return <RequirementsView data={requirementsData} />;

      case "planning":
        return <PlanningView data={planningData} />;

      case "architecture":
        return <ArchitectureView data={architectureData} />;

      case "code_generation":
        return renderCodeGeneration();

      default:
        return null;
    }
  };

  // WORKFLOW STATUS
  const isProjectStarted = activeTab !== null;

  const canShowApproval =
    activeTab &&
    ["requirements", "planning", "architecture"].includes(activeTab) &&
    agentStatus[activeTab] === "completed" &&
    !approvedStages[activeTab];

  // UI
  return (
    <div className="app">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectStarted={isProjectStarted}
        agentStatus={agentStatus}
      />

      <main className="main-content">
        <Header />

        {!isProjectStarted && (
          <section className="hero">
            <h1>Build Software With AI Agents 🚀</h1>

            <p>
              DevSynapse uses specialized AI agents to transform your software
              idea into requirements, a development plan, system architecture,
              and generated source code.
            </p>

            <ProjectInput
              projectIdea={projectIdea}
              setProjectIdea={setProjectIdea}
              onStart={handleStartProject}
            />
          </section>
        )}

        {isProjectStarted && (
          <AgentPipeline
            agentStatus={agentStatus}
            activeTab={activeTab}
          />
        )}

        {isProjectStarted && (
          <section className="workspace">
            <div className="tabs">
              {agentStatus.requirements !== "waiting" && (
                <button
                  className={`tab ${
                    activeTab === "requirements" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("requirements")}
                >
                  📋 Requirements
                </button>
              )}

              {agentStatus.planning !== "waiting" && (
                <button
                  className={`tab ${
                    activeTab === "planning" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("planning")}
                >
                  📅 Planning
                </button>
              )}

              {agentStatus.architecture !== "waiting" && (
                <button
                  className={`tab ${
                    activeTab === "architecture" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("architecture")}
                >
                  🏗 Architecture
                </button>
              )}

              {agentStatus.code_generation !== "waiting" && (
                <button
                  className={`tab ${
                    activeTab === "code_generation" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("code_generation")}
                >
                  <Code2 size={16} />
                  Code Generation
                </button>
              )}
            </div>

            <div className="workspace-content">
              {renderContent()}

              {activeTab === "requirements" && isEditing && (
                <form
                  className="requirements-editor"
                  onSubmit={handleRegenerate}
                >
                  <h3>Edit Requirements with AI</h3>

                  <p>
                    Describe the changes you want. The AI will update your
                    existing requirements based on your instructions.
                  </p>

                  <textarea
                    value={editInstructions}
                    onChange={(event) =>
                      setEditInstructions(event.target.value)
                    }
                    placeholder="Example: Add Google login, email verification, and account lockout after five failed login attempts."
                    rows={5}
                    disabled={isRegenerating}
                    required
                  />

                  <div className="approval-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setIsEditing(false)}
                      disabled={isRegenerating}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={
                        isRegenerating || !editInstructions.trim()
                      }
                    >
                      {isRegenerating
                        ? "Regenerating..."
                        : "Regenerate Requirements"}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "planning" && isEditingPlanning && (
                <form
                  className="requirements-editor"
                  onSubmit={handleRegeneratePlanning}
                >
                  <h3>Edit Development Plan with AI</h3>

                  <p>
                    Describe changes to the development plan, requirements,
                    or both. The AI will update the relevant outputs.
                  </p>

                  <textarea
                    value={planningEditInstructions}
                    onChange={(event) =>
                      setPlanningEditInstructions(event.target.value)
                    }
                    placeholder="Example: Add a password reset requirement and update the sprints and tasks to implement it."
                    rows={5}
                    disabled={isRegeneratingPlanning}
                    required
                  />

                  <div className="approval-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setIsEditingPlanning(false)}
                      disabled={isRegeneratingPlanning}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={
                        isRegeneratingPlanning ||
                        !planningEditInstructions.trim()
                      }
                    >
                      {isRegeneratingPlanning
                        ? "Updating Plan..."
                        : "Regenerate Planning"}
                    </button>
                  </div>
                </form>
              )}

              {canShowApproval &&
                !isEditing &&
                !isEditingPlanning && (
                  <ApprovalPanel
                    activeTab={activeTab}
                    onApprove={handleApprove}
                    onEdit={handleEdit}
                  />
                )}

              {approvedStages.architecture &&
                agentStatus.code_generation === "completed" && (
                  <div className="workflow-complete">
                    🎉 <strong>Code Generation Completed!</strong>

                    <p>
                      Your requirements, development plan, and architecture
                      have been approved, and the source files are ready
                      for review.
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
