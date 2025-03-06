// Enhanced initialization screen component

import React, { useState, useEffect } from "react";

/**
 * Initialization Screen Component
 *
 * This component provides a detailed visualization of the application
 * initialization process. It follows the "forest growth" metaphor by
 * showing how the different systems of the application come online
 * in stages, similar to how a forest ecosystem develops.
 *
 * @param {Object} props Component props
 * @param {Object} props.status Current initialization status
 * @param {Function} props.onDebugToggle Function to toggle debug mode
 */
const InitializationScreen = ({ status, onDebugToggle }) => {
  // Initialization stages
  const stages = [
    {
      id: "environment",
      name: "Environment Detection",
      description: "Analyzing your device capabilities",
    },
    {
      id: "storage",
      name: "Storage Preparation",
      description: "Setting up data persistence",
    },
    {
      id: "migration",
      name: "Data Migration",
      description: "Upgrading your data structures",
    },
    {
      id: "services",
      name: "Service Initialization",
      description: "Preparing application services",
    },
    { id: "ready", name: "Finishing Up", description: "Final preparations" },
  ];

  // Debug mode state
  const [showDebug, setShowDebug] = useState(false);

  // Animation state for the logo
  const [showLogo, setShowLogo] = useState(false);

  // Show logo animation when initialization is complete
  useEffect(() => {
    if (status && status.stage === "ready" && status.progress === 100) {
      setShowLogo(true);

      // Hide logo after animation completes
      const timer = setTimeout(() => {
        setShowLogo(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [status]);

  // Get current stage index
  const getCurrentStageIndex = () => {
    if (!status || !status.stage) return 0;

    const index = stages.findIndex((stage) => stage.id === status.stage);
    return index >= 0 ? index : 0;
  };

  const currentStageIndex = getCurrentStageIndex();
  const currentStage = stages[currentStageIndex];

  // Handle debug toggle
  const handleDebugToggle = () => {
    setShowDebug(!showDebug);
    if (onDebugToggle) {
      onDebugToggle(!showDebug);
    }
  };

  return (
    <div className="app-initializing">
      <div className="initializing-content">
        <h1>Growing Your Digital Forest</h1>

        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p>{currentStage.description}</p>
        </div>

        {/* Stage indicators */}
        <div className="initialization-stages">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`stage-indicator ${
                index < currentStageIndex
                  ? "completed"
                  : index === currentStageIndex
                  ? "active"
                  : ""
              }`}
              title={stage.name}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="initialization-progress">
          {status && status.progress !== undefined ? (
            <div
              className="progress-bar"
              style={{ width: `${status.progress}%` }}
            />
          ) : (
            <div className="progress-bar indeterminate" />
          )}
        </div>

        {/* Debug information panel */}
        {status && status.logs && (
          <div className={`initialization-debug ${showDebug ? "visible" : ""}`}>
            {status.logs.map((log, index) => (
              <div
                key={index}
                className={`debug-entry debug-${log.level || "info"}`}
              >
                <span className="debug-timestamp">{log.timestamp}</span>
                <span className="debug-message">{log.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Debug toggle button */}
        <button className="debug-toggle" onClick={handleDebugToggle}>
          {showDebug ? "Hide Technical Details" : "Show Technical Details"}
        </button>

        {/* Logo animation shown when initialization completes */}
        {showLogo && (
          <div className="app-ready-animation">
            <div className="app-logo-animation">
              <div className="app-logo-circle logo-circle-1"></div>
              <div className="app-logo-circle logo-circle-2"></div>
              <div className="app-logo-circle logo-circle-3"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InitializationScreen;
