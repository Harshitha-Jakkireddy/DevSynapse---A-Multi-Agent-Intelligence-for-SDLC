
import {
  Bot,
  FileText,
  CalendarDays,
  Boxes,
  Code2,
  CheckCircle2,
  Clock,
  LoaderCircle,
  LayoutDashboard,
  Sparkles,
  ChevronRight,
} from "lucide-react";

function Sidebar({
  activeTab,
  setActiveTab,
  projectStarted,
  agentStatus,
}) {
  const agents = [
    { id: "requirements", name: "Requirements", icon: FileText },
    { id: "planning", name: "Planning", icon: CalendarDays },
    { id: "architecture", name: "Architecture", icon: Boxes },
    { id: "code_generation", name: "Code Generation", icon: Code2 },
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
      <button
        className="logo"
        onClick={() => setActiveTab(null)}
        title="Return to workspace home"
      >
        <div className="logo-icon">
          <Bot size={25} />
          <span className="logo-sparkle">
            <Sparkles size={11} />
          </span>
        </div>

        <div className="logo-copy">
          <h1>DevSynapse</h1>
          <p>AI Developer Studio</p>
        </div>
      </button>

      <div className="sidebar-section">
        <p className="sidebar-title">WORKSPACE</p>

        <button
          className={`nav-item ${!activeTab ? "active" : ""}`}
          onClick={() => setActiveTab(null)}
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
          <ChevronRight size={15} className="nav-chevron" />
        </button>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-title">DEVELOPMENT AGENTS</p>

        {agents.map((agent) => {
          const Icon = agent.icon;
          const status = agentStatus?.[agent.id] || "waiting";

          const isClickable =
            projectStarted && status !== "waiting";

          return (
            <button
              key={agent.id}
              disabled={!isClickable}
              onClick={() => {
                if (isClickable) {
                  setActiveTab(agent.id);
                }
              }}
              title={
                !isClickable
                  ? "Complete the previous stage to access this agent"
                  : agent.name
              }
              className={`nav-item ${
                activeTab === agent.id ? "active" : ""
              } ${!isClickable ? "disabled" : ""}`}
            >
              <span className="agent-nav-icon">
                <Icon size={18} />
              </span>

              <span className="agent-nav-name">
                {agent.name}
              </span>

              <span className="agent-status">
                {getStatusIcon(status)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-icon">
          <Sparkles size={17} />
        </div>

        <div>
          <p className="sidebar-footer-title">
            AI-powered workflow
          </p>

          <p className="sidebar-footer-subtitle">
            From idea to generated code
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
