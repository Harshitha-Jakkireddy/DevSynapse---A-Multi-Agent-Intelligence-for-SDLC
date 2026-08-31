import {
  Bot,
  FileText,
  CalendarDays,
  Boxes,
  CheckCircle2,
  Clock,
  LoaderCircle,
  LayoutDashboard,
} from "lucide-react";

function Sidebar({
  activeTab,
  setActiveTab,
  projectStarted,
  agentStatus,
}) {
  const agents = [
    {
      id: "requirements",
      name: "Requirements",
      icon: FileText,
    },
    {
      id: "planning",
      name: "Planning",
      icon: CalendarDays,
    },
    {
      id: "architecture",
      name: "Architecture",
      icon: Boxes,
    },
  ];

  const getStatusIcon = (status) => {
    if (status === "completed") {
      return <CheckCircle2 size={16} className="status-completed" />;
    }

    if (status === "running") {
      return (
        <LoaderCircle
          size={16}
          className="status-running spinning"
        />
      );
    }

    return <Clock size={16} className="status-waiting" />;
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">
          <Bot size={24} />
        </div>

        <div>
          <h1>AgentDev</h1>
          <p>AI Software Studio</p>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-title">WORKSPACE</p>

        <button className="nav-item active">
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </button>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-title">AI AGENTS</p>

        {agents.map((agent) => {
          const Icon = agent.icon;
          const status = agentStatus?.[agent.id] || "waiting";

          const isClickable =
            projectStarted && status !== "waiting";

          return (
            <button
              key={agent.id}
              disabled={!isClickable}
              onClick={() => isClickable && setActiveTab(agent.id)}
              className={`nav-item ${
                activeTab === agent.id ? "active" : ""
              } ${!isClickable ? "disabled" : ""}`}
            >
              <Icon size={19} />

              <span>{agent.name}</span>

              <div className="agent-status">
                {getStatusIcon(status)}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;