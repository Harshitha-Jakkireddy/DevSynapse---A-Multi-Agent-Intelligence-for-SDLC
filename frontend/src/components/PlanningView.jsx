import {
  CalendarDays,
  Clock,
  Flag,
  AlertTriangle,
  Link,
  CheckSquare,
} from "lucide-react";

function PlanningView({ data }) {
  if (!data) {
    return (
      <div className="loading-agent">
        <h3>No development plan generated yet.</h3>
      </div>
    );
  }

  return (
    <div className="planning-view">

      {/* Header */}
      <div className="planning-header">
        <div>
          <h2>{data.project_name}</h2>
          <p>{data.project_overview}</p>
        </div>

        <div className="timeline-badge">
          <Clock size={18} />
          {data.estimated_timeline}
        </div>
      </div>


      {/* Development Phases */}
      <section className="planning-section">
        <div className="section-title">
          <Flag size={20} />
          <h3>Development Phases</h3>
        </div>

        <div className="phases-grid">
          {data.development_phases?.map((phase, index) => (
            <div className="phase-card" key={index}>
              <div className="phase-number">
                {index + 1}
              </div>

              <h4>{phase.phase}</h4>

              <p>{phase.description}</p>

              <span className="duration">
                <Clock size={15} />
                {phase.estimated_duration}
              </span>
            </div>
          ))}
        </div>
      </section>


      {/* Sprints */}
      <section className="planning-section">
        <div className="section-title">
          <CalendarDays size={20} />
          <h3>Sprint Plan</h3>
        </div>

        <div className="sprints-container">
          {data.sprints?.map((sprint) => (
            <div
              className="sprint-card"
              key={sprint.sprint_number}
            >
              <div className="sprint-header">
                <div>
                  <span className="sprint-number">
                    Sprint {sprint.sprint_number}
                  </span>

                  <h4>{sprint.title}</h4>
                </div>

                <span className="duration">
                  <Clock size={15} />
                  {sprint.estimated_duration}
                </span>
              </div>

              <p className="sprint-goal">
                <strong>Goal:</strong> {sprint.goal}
              </p>

              <div className="tasks-list">
                {sprint.tasks?.map((task) => (
                  <div className="task-item" key={task.id}>

                    <div className="task-main">
                      <CheckSquare size={17} />

                      <div>
                        <div className="task-title-row">
                          <strong>{task.title}</strong>

                          <span
                            className={`priority ${task.priority?.toLowerCase()}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <p>{task.description}</p>

                        <div className="task-meta">
                          <span>{task.id}</span>

                          <span>
                            <Clock size={14} />
                            {task.estimated_hours} hrs
                          </span>
                        </div>
                      </div>
                    </div>

                    {task.dependencies?.length > 0 && (
                      <div className="task-dependencies">
                        <Link size={14} />

                        Depends on:{" "}
                        {task.dependencies.join(", ")}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Risks */}
      <section className="planning-section">
        <div className="section-title">
          <AlertTriangle size={20} />
          <h3>Project Risks</h3>
        </div>

        <div className="risks-list">
          {data.risks?.map((risk, index) => (
            <div className="risk-item" key={index}>
              <AlertTriangle size={16} />
              {risk}
            </div>
          ))}
        </div>
      </section>


      {/* Dependencies */}
      <section className="planning-section">
        <div className="section-title">
          <Link size={20} />
          <h3>Project Dependencies</h3>
        </div>

        <div className="tag-container">
          {data.dependencies?.map((dependency, index) => (
            <span className="tag" key={index}>
              {dependency}
            </span>
          ))}
        </div>
      </section>

    </div>
  );
}

export default PlanningView;