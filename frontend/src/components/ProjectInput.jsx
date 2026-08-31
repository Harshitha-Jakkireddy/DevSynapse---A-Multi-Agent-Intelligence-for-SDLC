import { Sparkles } from "lucide-react";

function ProjectInput({ projectIdea, setProjectIdea, onStart }) {
  return (
    <div className="project-input">
      <textarea
        value={projectIdea}
        onChange={(e) => setProjectIdea(e.target.value)}
        placeholder="Describe the software project you want to build..."
      />

      <div className="input-footer">
        <p className="example-text">
          Example: Build a Hospital Management System with doctors, patients,
          appointments and billing.
        </p>

        <button className="primary-button" onClick={onStart}>
          <Sparkles size={18} />
          Generate Project Plan
        </button>
      </div>
    </div>
  );
}

export default ProjectInput;