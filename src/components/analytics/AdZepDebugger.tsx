/**
 * AdZep Test and Debug Component
 * Use this component to test and debug AdZep activation
 * Only use in development environment
 */

import React, { useState, useEffect } from "react";
import { useAdZep } from "../../hooks/useAdZep";
import { getAdZepState, resetAdZepState } from "../../lib/adZepUtils";

const AdZepDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebugger, setShowDebugger] = useState(false);

  const {
    isActivated,
    isActivating,
    activationAttempts,
    lastActivation,
    activate,
    reset,
  } = useAdZep(false); // Don't auto-activate for testing

  useEffect(() => {
    // Only show in development
    if (import.meta.env.DEV) {
      setShowDebugger(true);
    }

    const updateDebugInfo = () => {
      setDebugInfo({
        windowAdZepFunction: typeof window.AdZepActivateAds,
        globalState: getAdZepState(),
        timestamp: new Date().toISOString(),
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!showDebugger) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "#000",
        color: "#fff",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 9999,
        maxWidth: "300px",
        border: "1px solid #333",
      }}
    >
      <h4 style={{ margin: "0 0 10px 0", color: "#F8E71C" }}>
        AdZep Debug Panel
      </h4>

      <div style={{ marginBottom: "10px" }}>
        <strong>Hook State:</strong>
        <br />
        Activated: {isActivated ? "✅" : "❌"}
        <br />
        Activating: {isActivating ? "🔄" : "⏸️"}
        <br />
        Attempts: {activationAttempts}
        <br />
        Last: {lastActivation?.toLocaleTimeString() || "Never"}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Global State:</strong>
        <br />
        Function: {debugInfo?.windowAdZepFunction || "undefined"}
        <br />
        Activated: {debugInfo?.globalState?.activated ? "✅" : "❌"}
        <br />
        In Progress:{" "}
        {debugInfo?.globalState?.activationInProgress ? "🔄" : "⏸️"}
      </div>

      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        <button
          onClick={activate}
          style={{
            padding: "5px 8px",
            fontSize: "10px",
            background: "#007acc",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Activate
        </button>

        <button
          onClick={reset}
          style={{
            padding: "5px 8px",
            fontSize: "10px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>

        <button
          onClick={() => setShowDebugger(false)}
          style={{
            padding: "5px 8px",
            fontSize: "10px",
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Hide
        </button>
      </div>

      <div style={{ marginTop: "10px", fontSize: "10px", opacity: 0.7 }}>
        Updated: {debugInfo?.timestamp?.split("T")[1]?.split(".")[0]}
      </div>
    </div>
  );
};

export default AdZepDebugger;
