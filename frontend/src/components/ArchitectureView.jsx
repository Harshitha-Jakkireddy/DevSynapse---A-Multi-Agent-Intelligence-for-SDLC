import { ArrowDown } from "lucide-react";

function ArchitectureView({ data }) {
  // Prevent errors while data is loading
  if (!data) {
    return (
      <div className="info-card">
        <h3>Architecture data is not available yet.</h3>
      </div>
    );
  }

  return (
    <div>
      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <h2>{data.project_name || "System Architecture"}</h2>

      <p
        style={{
          color: "#94a3b8",
          marginTop: "8px",
          marginBottom: "10px",
        }}
      >
        Architecture Pattern:{" "}
        <strong>{data.architecture_style}</strong>
      </p>

      <p
        style={{
          color: "#cbd5e1",
          marginBottom: "30px",
          lineHeight: "1.6",
        }}
      >
        {data.architecture_overview}
      </p>

      {/* ===================================== */}
      {/* ARCHITECTURE LAYERS */}
      {/* ===================================== */}

      <h3 style={{ marginBottom: "20px" }}>
        🏗 Architecture Layers
      </h3>

      <div className="architecture-stack">
        {data.architecture_layers?.map((layer, index) => (
          <div
            key={index}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div className="arch-layer">
              <h4>{layer.name}</h4>

              <p>{layer.description}</p>

              {layer.components?.length > 0 && (
                <div
                  style={{
                    marginTop: "10px",
                    color: "#a5b4fc",
                    fontSize: "14px",
                  }}
                >
                  {layer.components.join(" • ")}
                </div>
              )}
            </div>

            {index < data.architecture_layers.length - 1 && (
              <ArrowDown
                className="arch-arrow"
                size={24}
              />
            )}
          </div>
        ))}
      </div>

      {/* ===================================== */}
      {/* TECHNOLOGY STACK */}
      {/* ===================================== */}

      <h3
        style={{
          marginTop: "35px",
          marginBottom: "20px",
        }}
      >
        ⚙️ Technology Stack
      </h3>

      <div className="grid">
        {data.technology_stack?.map((tech, index) => (
          <div className="info-card" key={index}>
            <h4>{tech.category}</h4>

            <p
              style={{
                color: "#a5b4fc",
                fontWeight: "bold",
                marginTop: "8px",
              }}
            >
              {tech.name}
            </p>

            <p
              style={{
                color: "#94a3b8",
                marginTop: "10px",
                lineHeight: "1.5",
              }}
            >
              {tech.reason}
            </p>
          </div>
        ))}
      </div>

      {/* ===================================== */}
      {/* SYSTEM COMPONENTS */}
      {/* ===================================== */}

      <h3
        style={{
          marginTop: "35px",
          marginBottom: "20px",
        }}
      >
        🧩 System Components
      </h3>

      <div className="grid">
        {data.system_components?.map((component, index) => (
          <div className="info-card" key={index}>
            <h4>{component.name}</h4>

            <p
              style={{
                color: "#94a3b8",
                marginTop: "8px",
                lineHeight: "1.5",
              }}
            >
              {component.responsibility}
            </p>

            <div
              style={{
                marginTop: "12px",
                color: "#a5b4fc",
                fontSize: "14px",
              }}
            >
              <strong>Technologies:</strong>{" "}
              {component.technologies?.join(", ")}
            </div>
          </div>
        ))}
      </div>

      {/* ===================================== */}
      {/* DATABASE + API */}
      {/* ===================================== */}

      <div
        className="grid"
        style={{ marginTop: "30px" }}
      >
        <div className="info-card">
          <h4>🗄 Database Design</h4>

          <p
            style={{
              color: "#94a3b8",
              marginTop: "10px",
              lineHeight: "1.6",
            }}
          >
            {data.database_design_overview}
          </p>
        </div>

        <div className="info-card">
          <h4>🔌 API Design</h4>

          <p
            style={{
              color: "#94a3b8",
              marginTop: "10px",
              lineHeight: "1.6",
            }}
          >
            {data.api_design_overview}
          </p>
        </div>
      </div>

      {/* ===================================== */}
      {/* FOLDER STRUCTURE */}
      {/* ===================================== */}

      <div
        className="info-card"
        style={{ marginTop: "30px" }}
      >
        <h4>📁 Recommended Project Structure</h4>

        <ul>
          {data.folder_structure?.map((folder, index) => (
            <li
              key={index}
              style={{
                fontFamily: "monospace",
                color: "#a5b4fc",
                marginTop: "8px",
              }}
            >
              {folder}
            </li>
          ))}
        </ul>
      </div>

      {/* ===================================== */}
      {/* COMMUNICATION FLOW */}
      {/* ===================================== */}

      <div
        className="info-card"
        style={{ marginTop: "30px" }}
      >
        <h4>🔄 Communication Flow</h4>

        <ol>
          {data.communication_flow?.map((step, index) => (
            <li
              key={index}
              style={{
                color: "#cbd5e1",
                marginTop: "10px",
                lineHeight: "1.5",
              }}
            >
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default ArchitectureView;