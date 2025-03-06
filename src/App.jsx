// Main application component with enhanced initialization
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";

// Import pages
import HomePage from "./pages/HomePage";
import BlogPage from "./pages/BlogPage";
import PostPage from "./pages/PostPage";
import CreatePostPage from "./pages/CreatePostPage";
import HabitsPage from "./pages/HabitsPage";

// Import application initialization
import { initializeApplication, isAppInitialized } from "./init/appInitializer";

// Import initialization component
import InitializationScreen from "./components/system/InitializationScreen";

// Import CSS
import "./styles/main.css";
import "./styles/habits.css";
import "./styles/enhanced-blog.css";
import "./styles/post-creation.css";
import "./styles/initialization.css";

function App() {
  const [appState, setAppState] = useState({
    initialized: isAppInitialized(),
    initializing: !isAppInitialized(),
    error: null,
    context: null,
    initStatus: {
      stage: "environment",
      progress: 0,
      logs: [],
    },
  });

  // Enable debug mode
  const [debugMode, setDebugMode] = useState(false);

  // Initialize application on first load
  useEffect(() => {
    if (appState.initialized) {
      console.log("Application already initialized");
      return;
    }

    if (!appState.initializing) {
      setAppState((prev) => ({ ...prev, initializing: true }));
    }

    // Log updates received during initialization
    const logUpdate = (stage, progress, message, level = "info") => {
      const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);

      setAppState((prev) => ({
        ...prev,
        initStatus: {
          stage,
          progress,
          logs: [
            { timestamp, message, level },
            ...prev.initStatus.logs.slice(0, 49), // Keep last 50 logs
          ],
        },
      }));
    };

    const initApp = async () => {
      try {
        // Environment detection stage
        logUpdate("environment", 0, "Starting application initialization");
        logUpdate("environment", 20, "Detecting browser capabilities");

        // Progress through initialization stages
        setTimeout(() => {
          logUpdate("storage", 30, "Setting up storage systems");
        }, 500);

        setTimeout(() => {
          logUpdate("migration", 50, "Checking for data migration needs");
        }, 1000);

        setTimeout(() => {
          logUpdate("services", 70, "Initializing application services");
        }, 1500);

        // Perform the actual initialization
        const result = await initializeApplication();

        setTimeout(() => {
          logUpdate("ready", 100, "Application initialization completed");

          if (result.success) {
            setAppState({
              initialized: true,
              initializing: false,
              error: null,
              context: result.appContext,
              initStatus: {
                stage: "ready",
                progress: 100,
                logs: appState.initStatus.logs,
              },
            });
          } else {
            logUpdate(
              "ready",
              100,
              `Initialization failed: ${result.error}`,
              "error"
            );

            setAppState({
              initialized: false,
              initializing: false,
              error: result.error || "Unknown initialization error",
              context: null,
              initStatus: {
                stage: "ready",
                progress: 100,
                logs: appState.initStatus.logs,
              },
            });
          }
        }, 2000);
      } catch (error) {
        console.error("Unhandled initialization error:", error);

        logUpdate("ready", 100, `Unexpected error: ${error.message}`, "error");

        setAppState({
          initialized: false,
          initializing: false,
          error: error.message || "Unexpected initialization error",
          context: null,
          initStatus: {
            stage: "ready",
            progress: 100,
            logs: appState.initStatus.logs,
          },
        });
      }
    };

    initApp();
  }, [appState.initialized, appState.initializing]);

  // Show loading state while initializing
  if (appState.initializing) {
    return (
      <InitializationScreen
        status={appState.initStatus}
        onDebugToggle={setDebugMode}
      />
    );
  }

  // Show error state if initialization failed
  if (appState.error) {
    return (
      <div className="app-error">
        <div className="error-content">
          <h1>Application Error</h1>
          <p className="error-message">
            We encountered a problem while setting up the application:
          </p>
          <div className="error-details">{appState.error}</div>

          {debugMode && appState.initStatus && appState.initStatus.logs && (
            <div className="initialization-debug visible">
              {appState.initStatus.logs.map((log, index) => (
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

          <div className="error-actions">
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Refresh and Try Again
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="reset-button"
            >
              Reset Application Data
            </button>
          </div>

          <button
            className="debug-toggle"
            onClick={() => setDebugMode(!debugMode)}
          >
            {debugMode ? "Hide Technical Details" : "Show Technical Details"}
          </button>
        </div>
      </div>
    );
  }

  // Main application UI
  return (
    <Router>
      <AppContextProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<PostPage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/habits" element={<HabitsPage />} />
        </Routes>
      </AppContextProvider>
    </Router>
  );
}

export default App;
