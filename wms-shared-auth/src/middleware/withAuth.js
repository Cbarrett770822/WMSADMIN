const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');

/**
 * Authentication middleware for Netlify Functions / Express
 * @param {Function} handler - Request handler function
 * @param {Object} options - Options { requireAuth: true, requireRole: null, requireApp: null }
 * @returns {Function} Wrapped handler
 */
function withAuth(handler, options = {}) {
  const {
    requireAuth = true,
    requireRole = null,
    requireApp = null
  } = options;

  return async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        body: ''
      };
    }

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    };

    try {
      // Extract token
      const authHeader = event.headers.authorization || event.headers.Authorization;
      const token = extractTokenFromHeader(authHeader);

      if (!token && requireAuth) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'Authentication required' })
        };
      }

      let user = null;
      if (token) {
        user = verifyToken(token);
        
        if (!user && requireAuth) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ message: 'Invalid or expired token' })
          };
        }
      }

      // Check role requirement
      if (requireRole && user) {
        const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
        if (!allowedRoles.includes(user.role)) {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ message: 'Insufficient permissions' })
          };
        }
      }

      // Check app access requirement
      if (requireApp && user) {
        const appKey = requireApp.replace(/-/g, '');
        const hasAccess = user.role === 'super_admin' || 
                         (user.appPermissions && 
                          user.appPermissions[appKey] && 
                          user.appPermissions[appKey].enabled);
        
        if (!hasAccess) {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ message: `Access denied to ${requireApp}` })
          };
        }
      }

      // Call the handler with user context
      return await handler(event, context, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Internal server error' })
      };
    }
  };
}

module.exports = { withAuth };
