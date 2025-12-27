const mongoose = require('mongoose');

let cachedConnection = null;

/**
 * Connect to MongoDB with connection pooling
 * @returns {Promise<mongoose.Connection>}
 */
async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached database connection');
    return cachedConnection;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    console.log('Creating new database connection...');
    
    const connection = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = connection;
    console.log('Database connected successfully');
    
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
async function closeDatabaseConnection() {
  if (cachedConnection) {
    await mongoose.connection.close();
    cachedConnection = null;
    console.log('Database connection closed');
  }
}

/**
 * Check if database is connected
 * @returns {Boolean}
 */
function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
  isDatabaseConnected
};
