const { connectToDatabase } = require('../../wms-shared-auth/src/utils/db');
const User = require('../../wms-shared-auth/src/models/User');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  try {
    await connectToDatabase();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@wms.com' });
    
    if (existingAdmin) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Admin user already exists', email: 'admin@wms.com' })
      };
    }

    // Create super admin
    const admin = new User({
      email: 'admin@wms.com',
      username: 'admin',
      passwordHash: 'admin123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      isActive: true,
      appPermissions: {
        wmsQuestionnaire: { enabled: true, role: 'admin', assignedCompanies: [] },
        roiAssessment: { enabled: true, role: 'admin', assignedCompanies: [] },
        dashboardGenerator: { enabled: true, role: 'admin' },
        demoAssist: { enabled: true, role: 'admin' }
      }
    });

    await admin.save();

    // Create test user
    const testUser = new User({
      email: 'user@wms.com',
      username: 'testuser',
      passwordHash: 'user123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isActive: true,
      appPermissions: {
        wmsQuestionnaire: { enabled: true, role: 'user', assignedCompanies: [] },
        roiAssessment: { enabled: true, role: 'user', assignedCompanies: [] },
        dashboardGenerator: { enabled: false, role: 'user' },
        demoAssist: { enabled: false, role: 'user' }
      }
    });

    await testUser.save();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Database initialized successfully',
        users: [
          { email: 'admin@wms.com', password: 'admin123', role: 'super_admin' },
          { email: 'user@wms.com', password: 'user123', role: 'user' }
        ]
      })
    };
  } catch (error) {
    console.error('Init DB error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Database initialization failed', error: error.message })
    };
  }
};
