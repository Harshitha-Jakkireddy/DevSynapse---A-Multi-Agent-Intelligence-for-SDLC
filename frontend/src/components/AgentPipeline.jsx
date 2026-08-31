import {
  FileText,
  CalendarDays,
  Boxes,
  CheckCircle2,
  Clock,
  LoaderCircle,
} from "lucide-react";

function AgentPipeline({ agentStatus, activeTab }) {
  const steps = [
    {
      id: "requirements",
      title: "Requirements Agent",
      description: "Analyzing project requirements",
      icon: FileText,
    },
    {
      id: "planning",
      title: "Planning Agent",
      description: "Creating development roadmap",
      icon: CalendarDays,
    },
    {
      id: "architecture",
      title: "Architecture Agent",
      description: "Designing system architecture",
      icon: Boxes,
    },
  ];

  const getStatusContent = (status) => {
    if (status === "completed") {
      return (
        <>
          <CheckCircle2 size={15} />
          Completed
        </>
      );
    }

    if (status === "running") {
      return (
        <>
          <LoaderCircle size={15} className="spinning" />
          Running
        </>
      );
    }

    return (
      <>
        <Clock size={15} />
        Waiting
      </>
    );
  };

  const completedCount = Object.values(agentStatus).filter(
    (status) => status === "completed"
  ).length;

  return (
    <div className="pipeline-card">
      <div className="section-heading">
        <h3>AI Development Pipeline</h3>

        <span>{completedCount}/3 Agents Completed</span>
      </div>

      <div className="pipeline">
        {steps.map((step) => {
          const Icon = step.icon;
          const status = agentStatus[step.id];

          return (
            <div
              key={step.id}
              className={`pipeline-step ${status} ${
                activeTab === step.id ? "current-step" : ""
              }`}
            >
              <div className="step-icon">
                <Icon size={24} />
              </div>

              <h4>{step.title}</h4>

              <p>{step.description}</p>

              <div className={`step-label ${status}`}>
                {getStatusContent(status)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AgentPipeline;