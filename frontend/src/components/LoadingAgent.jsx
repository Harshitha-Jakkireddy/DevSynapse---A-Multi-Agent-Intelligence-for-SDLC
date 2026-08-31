import { LoaderCircle, Bot } from "lucide-react";

function LoadingAgent({ agentName }) {
  return (
    <div className="loading-agent">
      <div className="loading-icon">
        <Bot size={48} />
      </div>

      <h3>{agentName} is working...</h3>

      <p>
        Analyzing information and generating structured output.
      </p>

      <LoaderCircle
        size={32}
        className="spinning loading-spinner"
      />
    </div>
  );
}

export default LoadingAgent;