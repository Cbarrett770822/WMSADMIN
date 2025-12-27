const { withAuth } = require('../../wms-shared-auth/src/middleware/withAuth');
const { connectToDatabase } = require('../../wms-shared-auth/src/utils/db');
const User = require('../../wms-shared-auth/src/models/User');

async function handler(event, context, user) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    await connectToDatabase();

    const { email, username, firstName, lastName, password, role, isActive } = JSON.parse(event.body);

    if (!email || !username || !firstName || !lastName || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'All fields are required' })
      };
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'User with this email or username already exists' })
      };
    }

    const newUser = new User({
      email: email.toLowerCase(),
      username,
      firstName,
      lastName,
      passwordHash: password,
      role: role || 'user',
      isActive: isActive !== undefined ? isActive : true,
      createdBy: user.userId,
      appPermissions: {
        wmsQuestionnaire: { enabled: false, role: 'user', assignedCompanies: [] },
        roiAssessment: { enabled: false, role: 'user', assignedCompanies: [] },
        dashboardGenerator: { enabled: false, role: 'user' },
        demoAssist: { enabled: false, role: 'user' }
      }
    });

    await newUser.save();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'User created successfully',
        userId: newUser._id
      })
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Failed to create user' })
    };
  }
}

exports.handler = withAuth(handler, {
  requireAuth: true,
  requireRole: ['super_admin', 'admin']
});
