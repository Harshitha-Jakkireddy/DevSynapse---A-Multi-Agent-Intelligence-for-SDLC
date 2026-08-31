import {
  FileText,
  Shield,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function RequirementsView({ data }) {
  if (!data) {
    return (
      <div className="loading-agent">
        <h3>No requirements generated yet.</h3>
      </div>
    );
  }

  return (
    <div className="requirements-view">

      {/* Header */}
      <div className="requirements-header">
        <div className="requirements-title">
          <div className="requirements-icon">
            <FileText size={28} />
          </div>

          <div>
            <h2>{data.project_name}</h2>

            <p>
              AI Generated Software Requirements
            </p>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <section className="requirement-section">
        <h3>Project Summary</h3>

        <p className="project-summary">
          {data.project_summary}
        </p>
      </section>

      {/* Functional Requirements */}
      <section className="requirement-section">
        <div className="section-title">
          <FileText size={20} />

          <h3>Functional Requirements</h3>
        </div>

        <div className="requirements-list">
          {data.functional_requirements?.map((requirement) => (
            <div
              className="requirement-card"
              key={requirement.id}
            >
              <div className="requirement-top">
                <span className="requirement-id">
                  {requirement.id}
                </span>

                <span
                  className={`priority ${
                    requirement.priority?.toLowerCase()
                  }`}
                >
                  {requirement.priority}
                </span>
              </div>

              <h4>{requirement.title}</h4>

              <p>{requirement.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Non Functional Requirements */}
      <section className="requirement-section">
        <div className="section-title">
          <Shield size={20} />

          <h3>Non-Functional Requirements</h3>
        </div>

        <div className="non-functional-grid">
          {data.non_functional_requirements?.map(
            (requirement, index) => (
              <div
                className="non-functional-card"
                key={index}
              >
                <h4>{requirement.category}</h4>

                <p>{requirement.description}</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Suggested Users */}
      <section className="requirement-section">
        <div className="section-title">
          <Users size={20} />

          <h3>Suggested Users</h3>
        </div>

        <div className="tag-container">
          {data.suggested_users?.map((user, index) => (
            <span className="tag" key={index}>
              {user}
            </span>
          ))}
        </div>
      </section>

      {/* Assumptions */}
      <section className="requirement-section">
        <div className="section-title">
          <CheckCircle2 size={20} />

          <h3>Assumptions</h3>
        </div>

        <ul className="info-list">
          {data.assumptions?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Out of Scope */}
      <section className="requirement-section">
        <div className="section-title">
          <AlertCircle size={20} />

          <h3>Out of Scope</h3>
        </div>

        <ul className="info-list out-of-scope">
          {data.out_of_scope?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

    </div>
  );
}

export default RequirementsView;