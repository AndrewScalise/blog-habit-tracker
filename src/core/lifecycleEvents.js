// Application lifecycle event system

/**
 * The Lifecycle Event System
 *
 * In a forest ecosystem, seasonal changes trigger cascading events:
 * - Spring triggers seed germination, leaf growth, and animal activity
 * - Summer enables photosynthesis, growth, and resource accumulation
 * - Fall initiates resource conservation and preparation for dormancy
 * - Winter enables rest and internal restructuring
 *
 * Similarly, our application needs coordinated "seasonal" transitions:
 * - Initialization phase (Spring): Services start up and prepare resources
 * - Active phase (Summer): User interactions and data processing occur
 * - Suspension phase (Fall): Resources are conserved when app is backgrounded
 * - Dormant phase (Winter): Data is persisted and memory is cleared
 *
 * This event system enables decoupled components to respond to these
 * lifecycle transitions without direct dependencies on each other.
 */

// Event types
const LIFECYCLE_EVENTS = {
  // Initialization events
  INIT_START: "lifecycle:init:start", // Application initialization begins
  INIT_COMPLETE: "lifecycle:init:complete", // Application fully initialized
  INIT_ERROR: "lifecycle:init:error", // Initialization failed

  // Routing events
  ROUTE_CHANGED: "lifecycle:route:changed", // User navigated to new route

  // Session events
  SESSION_START: "lifecycle:session:start", // New user session started
  SESSION_END: "lifecycle:session:end", // User session ended

  // Focus events
  FOCUS_GAINED: "lifecycle:focus:gained", // Application gained focus
  FOCUS_LOST: "lifecycle:focus:lost", // Application lost focus

  // Data events
  DATA_CHANGED: "lifecycle:data:changed", // Underlying data was modified
  DATA_SYNC: "lifecycle:data:sync", // Data synchronization requested

  // Shutdown events
  SHUTDOWN_START: "lifecycle:shutdown:start", // Application beginning shutdown
  SHUTDOWN_COMPLETE: "lifecycle:shutdown:complete", // Shutdown complete
};

// Event listeners registry
// We use a Map where keys are event types and values are arrays of listener functions
const listeners = new Map();

/**
 * Register a listener for a lifecycle event
 *
 * @param {string} eventType - Type of event to listen for
 * @param {Function} listener - Callback function
 * @returns {Function} - Unsubscribe function
 */
function on(eventType, listener) {
  if (!listeners.has(eventType)) {
    listeners.set(eventType, []);
  }

  listeners.get(eventType).push(listener);

  // Return function to unsubscribe
  return () => {
    const eventListeners = listeners.get(eventType);
    const index = eventListeners.indexOf(listener);
    if (index !== -1) {
      eventListeners.splice(index, 1);
    }
  };
}

/**
 * Emit a lifecycle event
 *
 * @param {string} eventType - Type of event to emit
 * @param {Object} data - Event data
 */
function emit(eventType, data = {}) {
  // Add timestamp and event type to data
  const eventData = {
    ...data,
    timestamp: new Date().toISOString(),
    type: eventType,
  };

  // Log event for debugging (could be conditional based on debug mode)
  console.debug(`Lifecycle Event: ${eventType}`, eventData);

  // If no listeners for this event, return
  if (!listeners.has(eventType)) {
    return;
  }

  // Call all listeners for this event
  listeners.get(eventType).forEach((listener) => {
    try {
      listener(eventData);
    } catch (error) {
      console.error(
        `Error in lifecycle event listener for ${eventType}:`,
        error
      );
    }
  });
}

/**
 * Remove all listeners for a specific event type
 *
 * @param {string} eventType - Event type to clear listeners for
 */
function off(eventType) {
  listeners.delete(eventType);
}

/**
 * Setup browser window-related event listeners
 */
function setupWindowEvents() {
  // Handle visibility changes
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      emit(LIFECYCLE_EVENTS.FOCUS_GAINED);
    } else {
      emit(LIFECYCLE_EVENTS.FOCUS_LOST);
    }
  });

  // Handle before unload
  window.addEventListener("beforeunload", () => {
    emit(LIFECYCLE_EVENTS.SHUTDOWN_START);
  });

  // Handle online/offline status
  window.addEventListener("online", () => {
    emit(LIFECYCLE_EVENTS.DATA_SYNC, { isOnline: true });
  });

  window.addEventListener("offline", () => {
    emit(LIFECYCLE_EVENTS.DATA_SYNC, { isOnline: false });
  });
}

/**
 * Initialize the lifecycle event system
 */
function initializeLifecycleEvents() {
  setupWindowEvents();
  emit(LIFECYCLE_EVENTS.INIT_START);
}

// Export the lifecycle event API
export const lifecycleEvents = {
  EVENTS: LIFECYCLE_EVENTS,
  on,
  emit,
  off,
  initialize: initializeLifecycleEvents,
};
