
import { Activity, Sparkles } from "lucide-react";

function Header() {
  return (
    <header className="header">
      <div className="header-copy">
        <div className="header-eyebrow">
          <Sparkles size={14} />
          <span>YOUR AI DEVELOPMENT WORKSPACE</span>
        </div>

        <h2>Build something extraordinary.</h2>

        <p>
          Turn your software idea into requirements, plans, and architecture.
        </p>
      </div>

      <div className="online-status">
        <span className="online-dot" />
        <Activity size={15} />
        <span>AI Workspace</span>
        <span className="status-label">Ready</span>
      </div>
    </header>
  );
}

export default Header;
