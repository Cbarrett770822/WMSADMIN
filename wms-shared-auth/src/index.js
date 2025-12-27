// Models
const User = require('./models/User');

// Utils
const { generateToken, verifyToken, decodeToken, extractTokenFromHeader } = require('./utils/jwt');
const { hashPassword, comparePassword, validatePasswordStrength, generateRandomPassword } = require('./utils/password');
const { connectToDatabase, closeDatabaseConnection, isDatabaseConnected } = require('./utils/db');

// Middleware
const { withAuth } = require('./middleware/withAuth');

module.exports = {
  // Models
  User,
  
  // JWT Utils
  generateToken,
  verifyToken,
  decodeToken,
  extractTokenFromHeader,
  
  // Password Utils
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateRandomPassword,
  
  // Database Utils
  connectToDatabase,
  closeDatabaseConnection,
  isDatabaseConnected,
  
  // Middleware
  withAuth
};
