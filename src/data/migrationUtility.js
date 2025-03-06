// Utility for migrating data from localStorage to IndexedDB
import { enhancedPostService } from './enhancedPostService';
import { enhancedHabitService } from './enhancedHabitService';

/**
 * This utility handles the migration of data from localStorage to IndexedDB.
 * 
 * Migration Process:
 * 1. Check if migration is needed by looking for a migration flag in localStorage
 * 2. If not migrated yet, migrate posts and habits to IndexedDB
 * 3. Set migration flag in localStorage to prevent duplicate migrations
 * 
 * This provides a smooth transition path while maintaining backward compatibility
 * with components that might still expect data to be in localStorage.
 */

const MIGRATION_FLAG = 'data_migrated_to_indexeddb';

/**
 * Check if data migration has already been performed
 * @returns {boolean} True if already migrated
 */
function hasMigrationBeenPerformed() {
  return localStorage.getItem(MIGRATION_FLAG) === 'true';
}

/**
 * Mark migration as completed
 */
function markMigrationComplete() {
  localStorage.setItem(MIGRATION_FLAG, 'true');
  console.log('Data migration marked as complete');
}

/**
 * Perform the full migration process
 * @returns {Promise<void>}
 */
export async function migrateDataToIndexedDB() {
  // Check if migration has already been performed
  if (hasMigrationBeenPerformed()) {
    console.log('Data already migrated to IndexedDB, skipping migration');
    return;
  }
  
  console.log('Starting data migration to IndexedDB...');
  
  try {
    // Migrate posts
    await enhancedPostService.migrateFromLocalStorage();
    
    // Migrate habits
    await enhancedHabitService.migrateFromLocalStorage();
    
    // Mark migration as completed
    markMigrationComplete();
    
    console.log('Data migration to IndexedDB completed successfully');
  } catch (error) {
    console.error('Error during data migration:', error);
    // Don't mark as completed if there was an error
  }
}

/**
 * Initialize data services and perform migration if needed
 * This should be called early in the application lifecycle
 * @returns {Promise<void>}
 */
export async function initializeDataServices() {
  try {
    console.log('Initializing data services...');
    
    // Perform migration if needed
    await migrateDataToIndexedDB();
    
    // Initialize data services
    await Promise.all([
      enhancedPostService.getPosts(), // This will initialize posts if empty
      enhancedHabitService.getHabits() // This will initialize habits if empty
    ]);
    
    console.log('Data services initialized successfully');
  } catch (error) {
    console.error('Error initializing data services:', error);
  }
}

/**
 * Create compatability layer to ensure backward compatibility
 * This replaces the global localStorage-based services with IndexedDB versions
 * while maintaining the same API
 */
export function setupCompatibilityLayer() {
  // For backward compatibility with components using the old services
  window.postService = enhancedPostService;
  window.habitService = enhancedHabitService;
  
  console.log('Compatibility layer set up for data services');
}