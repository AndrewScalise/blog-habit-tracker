// Application initialization system

/**
 * The Application Initializer serves as the orchestration layer for bootstrapping
 * the entire application ecosystem. Just as seeds need specific conditions to
 * germinate and grow into a forest, our application needs systematic initialization
 * to ensure all systems are properly connected and configured.
 * 
 * This module follows a phased initialization approach:
 * 1. Environment Detection - Understand the browser capabilities
 * 2. Storage Preparation - Set up data persistence
 * 3. Service Configuration - Initialize application services
 * 4. Migration Execution - Perform any needed data migrations
 * 5. Ready Notification - Signal that the app is ready
 */

import { dbService } from '../data/dbService';
import { 
  initializeDataServices, 
  migrateDataToIndexedDB, 
  setupCompatibilityLayer 
} from '../data/migrationUtility';

// Environment detection - Check browser capabilities
function detectEnvironment() {
  const environment = {
    indexedDBSupported: 'indexedDB' in window,
    localStorageSupported: 'localStorage' in window,
    serviceWorkerSupported: 'serviceWorker' in navigator,
    isOnline: navigator.onLine,
    screenSize: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    userAgent: navigator.userAgent,
    // More environment details could be detected here
  };
  
  console.log('Environment detected:', environment);
  return environment;
}

// Feature flags - Define which features are enabled
function configureFeatureFlags(environment) {
  const features = {
    useIndexedDB: environment.indexedDBSupported,
    useLocalStorage: environment.localStorageSupported,
    enableOfflineMode: environment.serviceWorkerSupported,
    enableHighPerformanceMode: environment.screenSize.width > 1024,
    // More feature flags could be defined here
  };
  
  console.log('Features configured:', features);
  return features;
}

// Error handling - Configure global error handling
function setupErrorHandling() {
  // Global error handler for uncaught exceptions
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', { message, source, lineno, colno, error });
    // Could send error to analytics/monitoring service
    return false; // Let default handler run
  };
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    // Could send error to analytics/monitoring service
  });
  
  console.log('Global error handling configured');
}

// Performance monitoring - Set up basic performance tracking
function setupPerformanceMonitoring() {
  if ('performance' in window && 'mark' in performance) {
    // Mark initialization start
    performance.mark('app_init_start');
    
    // Create a function to mark initialization end
    const markInitEnd = () => {
      performance.mark('app_init_end');
      performance.measure('app_initialization', 'app_init_start', 'app_init_end');
      
      const measurements = performance.getEntriesByType('measure');
      console.log('App initialization time:', 
        measurements[measurements.length - 1].duration.toFixed(2), 'ms');
    };
    
    return { markInitEnd };
  }
  
  // Fallback if Performance API not available
  return { markInitEnd: () => console.log('Performance API not available') };
}

/**
 * Main initialization function
 * This orchestrates the entire initialization process
 * 
 * @returns {Promise<Object>} Initialization result with app context
 */
export async function initializeApplication() {
  // Start performance monitoring
  const perfMonitoring = setupPerformanceMonitoring();
  
  try {
    console.log('Starting application initialization...');
    
    // Phase 1: Environment Detection
    const environment = detectEnvironment();
    
    // Phase 2: Feature Configuration
    const features = configureFeatureFlags(environment);
    
    // Phase 3: Error Handling
    setupErrorHandling();
    
    // Phase 4: Storage Preparation
    console.log('Preparing storage systems...');
    
    if (features.useIndexedDB) {
      try {
        // Test IndexedDB connectivity
        await dbService.countRecords(dbService.STORES.SETTINGS);
        console.log('IndexedDB is working correctly');
      } catch (dbError) {
        console.error('IndexedDB error:', dbError);
        // Fall back to localStorage if IndexedDB fails
        features.useIndexedDB = false;
      }
    }
    
    // Phase 5: Data Migration
    if (features.useIndexedDB) {
      await migrateDataToIndexedDB();
    }
    
    // Phase 6: Service Initialization
    console.log('Initializing data services...');
    await initializeDataServices();
    
    // Phase 7: Compatibility Layer
    setupCompatibilityLayer();
    
    // Phase 8: Final Configuration
    const appContext = {
      environment,
      features,
      initialized: true,
      initTime: new Date().toISOString()
    };
    
    // Store initialization info
    if (features.useLocalStorage) {
      localStorage.setItem('app_context', JSON.stringify(appContext));
    }
    
    // Mark initialization complete
    perfMonitoring.markInitEnd();
    
    console.log('Application initialization completed successfully');
    return { success: true, appContext };
  } catch (error) {
    console.error('Application initialization failed:', error);
    perfMonitoring.markInitEnd();
    return { 
      success: false, 
      error: error.message,
      details: error
    };
  }
}

/**
 * Check if the application is already initialized
 * 
 * @returns {boolean} True if initialized
 */
export function isAppInitialized() {
  try {
    const storedContext = localStorage.getItem('app_context');
    if (storedContext) {
      const context = JSON.parse(storedContext);
      return context.initialized === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking initialization status:', error);
    return false;
  }
}

/**
 * Get the application context if initialized
 * 
 * @returns {Object|null} App context or null if not initialized
 */
export function getAppContext() {
  try {
    const storedContext = localStorage.getItem('app_context');
    return storedContext ? JSON.parse(storedContext) : null;
  } catch (error) {
    console.error('Error getting app context:', error);
    return null;
  }
}