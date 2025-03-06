// IndexedDB-based storage service for enhanced data persistence

/**
 * IndexedDB database wrapper for storing blog posts and habit data
 * This provides a more robust alternative to localStorage with:
 * - Larger storage capacity
 * - Better performance for large datasets
 * - Transaction-based operations
 * - Indexed queries
 */

// Database configuration
const DB_NAME = "blog_habit_tracker_db";
const DB_VERSION = 1;
const STORES = {
  POSTS: "posts",
  HABITS: "habits",
  SETTINGS: "settings",
};

// Create and initialize the database
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Handle database upgrade (called when DB is created or version changes)
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.POSTS)) {
        const postsStore = db.createObjectStore(STORES.POSTS, {
          keyPath: "id",
        });
        // Create indexes for efficient queries
        postsStore.createIndex("date", "date", { unique: false });
        postsStore.createIndex("title", "title", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.HABITS)) {
        const habitsStore = db.createObjectStore(STORES.HABITS, {
          keyPath: "id",
        });
        // Create indexes for efficient queries
        habitsStore.createIndex("name", "name", { unique: false });
        habitsStore.createIndex("created", "created", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        const settingsStore = db.createObjectStore(STORES.SETTINGS, {
          keyPath: "id",
        });
      }
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
  });
}

// Get a database connection
async function getDB() {
  try {
    return await initDB();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Generic function to execute a database operation
 *
 * @param {string} storeName - Name of the object store
 * @param {string} mode - Transaction mode (readonly or readwrite)
 * @param {Function} operation - Function that performs the operation
 * @returns {Promise} - Resolves with the operation result
 */
async function executeDBOperation(storeName, mode, operation) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    transaction.oncomplete = () => {
      db.close();
    };

    transaction.onerror = (event) => {
      console.error("Transaction error:", event.target.error);
      reject(event.target.error);
    };

    try {
      operation(store, resolve, reject);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Create a new record in the specified store
 *
 * @param {string} storeName - Name of the object store
 * @param {Object} data - Data to store
 * @returns {Promise} - Resolves with the stored data
 */
async function create(storeName, data) {
  return executeDBOperation(
    storeName,
    "readwrite",
    (store, resolve, reject) => {
      const request = store.add(data);

      request.onsuccess = () => {
        resolve(data);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    }
  );
}

/**
 * Get all records from the specified store
 *
 * @param {string} storeName - Name of the object store
 * @returns {Promise} - Resolves with an array of records
 */
async function getAll(storeName) {
  return executeDBOperation(storeName, "readonly", (store, resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * Get a record by ID from the specified store
 *
 * @param {string} storeName - Name of the object store
 * @param {string} id - Record ID
 * @returns {Promise} - Resolves with the record or null if not found
 */
async function getById(storeName, id) {
  return executeDBOperation(storeName, "readonly", (store, resolve, reject) => {
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * Update a record in the specified store
 *
 * @param {string} storeName - Name of the object store
 * @param {string} id - Record ID
 * @param {Object} data - Updated data
 * @returns {Promise} - Resolves with the updated data
 */
async function update(storeName, id, data) {
  return executeDBOperation(
    storeName,
    "readwrite",
    (store, resolve, reject) => {
      // First check if the record exists
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          reject(new Error(`Record with ID ${id} not found`));
          return;
        }

        // Merge existing record with new data
        const updatedData = {
          ...getRequest.result,
          ...data,
          id, // Ensure ID remains the same
        };

        // Update the record
        const updateRequest = store.put(updatedData);

        updateRequest.onsuccess = () => {
          resolve(updatedData);
        };

        updateRequest.onerror = (event) => {
          reject(event.target.error);
        };
      };

      getRequest.onerror = (event) => {
        reject(event.target.error);
      };
    }
  );
}

/**
 * Delete a record from the specified store
 *
 * @param {string} storeName - Name of the object store
 * @param {string} id - Record ID
 * @returns {Promise} - Resolves with the ID of the deleted record
 */
async function remove(storeName, id) {
  return executeDBOperation(
    storeName,
    "readwrite",
    (store, resolve, reject) => {
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(id);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    }
  );
}

/**
 * Query records using an index
 *
 * @param {string} storeName - Name of the object store
 * @param {string} indexName - Name of the index to query
 * @param {any} value - Value to search for
 * @returns {Promise} - Resolves with an array of matching records
 */
async function queryByIndex(storeName, indexName, value) {
  return executeDBOperation(storeName, "readonly", (store, resolve, reject) => {
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * Advanced query with key range (for date ranges, etc.)
 *
 * @param {string} storeName - Name of the object store
 * @param {string} indexName - Name of the index to query
 * @param {IDBKeyRange} range - Key range to search within
 * @returns {Promise} - Resolves with an array of matching records
 */
async function queryByRange(storeName, indexName, range) {
  return executeDBOperation(storeName, "readonly", (store, resolve, reject) => {
    const index = store.index(indexName);
    const request = index.getAll(range);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * Clear all records from a store
 *
 * @param {string} storeName - Name of the object store
 * @returns {Promise} - Resolves when complete
 */
async function clearStore(storeName) {
  return executeDBOperation(
    storeName,
    "readwrite",
    (store, resolve, reject) => {
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    }
  );
}

/**
 * Count the number of records in a store
 *
 * @param {string} storeName - Name of the object store
 * @returns {Promise} - Resolves with the record count
 */
async function countRecords(storeName) {
  return executeDBOperation(storeName, "readonly", (store, resolve, reject) => {
    const request = store.count();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * Migration utility - import data from localStorage to IndexedDB
 * This helps transition from the previous storage method
 *
 * @returns {Promise} - Resolves when migration is complete
 */
async function migrateFromLocalStorage() {
  // Migrate blog posts
  const postsString = localStorage.getItem("blog_posts");
  if (postsString) {
    try {
      const posts = JSON.parse(postsString);
      const db = await getDB();
      const transaction = db.transaction(STORES.POSTS, "readwrite");
      const store = transaction.objectStore(STORES.POSTS);

      // Wait for all posts to be added
      await Promise.all(
        posts.map((post) => {
          return new Promise((resolve, reject) => {
            const request = store.add(post);
            request.onsuccess = resolve;
            request.onerror = reject;
          });
        })
      );

      console.log("Successfully migrated posts from localStorage to IndexedDB");
    } catch (error) {
      console.error("Error migrating posts:", error);
    }
  }

  // Migrate habit data
  const habitsString = localStorage.getItem("habit_tracker_data");
  if (habitsString) {
    try {
      const habits = JSON.parse(habitsString);
      const db = await getDB();
      const transaction = db.transaction(STORES.HABITS, "readwrite");
      const store = transaction.objectStore(STORES.HABITS);

      // Wait for all habits to be added
      await Promise.all(
        habits.map((habit) => {
          return new Promise((resolve, reject) => {
            const request = store.add(habit);
            request.onsuccess = resolve;
            request.onerror = reject;
          });
        })
      );

      console.log(
        "Successfully migrated habits from localStorage to IndexedDB"
      );
    } catch (error) {
      console.error("Error migrating habits:", error);
    }
  }
}

// Export the database service
export const dbService = {
  STORES,
  create,
  getAll,
  getById,
  update,
  remove,
  queryByIndex,
  queryByRange,
  clearStore,
  countRecords,
  migrateFromLocalStorage,
};
