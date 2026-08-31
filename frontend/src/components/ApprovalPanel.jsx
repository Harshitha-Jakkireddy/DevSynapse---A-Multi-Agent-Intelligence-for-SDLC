import { CheckCircle2, Pencil } from "lucide-react";

function ApprovalPanel({
  activeTab,
  onApprove,
  onEdit,
}) {
  const names = {
    requirements: "Requirements",
    planning: "Development Plan",
    architecture: "Architecture",
  };

  const buttonText = {
    requirements: "Approve & Start Planning",
    planning: "Approve & Start Architecture",
    architecture: "Approve Architecture",
  };

  return (
    <div className="approval-panel">
      <div>
        <h4>Approve {names[activeTab]}</h4>

        <p>
          Review the AI-generated output before continuing to the next stage.
        </p>
      </div>

      <div className="approval-actions">
        <button
          className="secondary-button"
          onClick={onEdit}
        >
          <Pencil size={15} />
          Edit
        </button>

        <button
          className="primary-button"
          onClick={onApprove}
        >
          <CheckCircle2 size={16} />
          {buttonText[activeTab]}
        </button>
      </div>
    </div>
  );
}

export default ApprovalPanel;