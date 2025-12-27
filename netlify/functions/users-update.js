const { withAuth } = require('../../wms-shared-auth/src/middleware/withAuth');
const { connectToDatabase } = require('../../wms-shared-auth/src/utils/db');
const { hashPassword } = require('../../wms-shared-auth/src/utils/password');
const User = require('../../wms-shared-auth/src/models/User');

async function handler(event, context, user) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    await connectToDatabase();

    const { userId, email, username, firstName, lastName, password, role, isActive } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'User ID is required' })
      };
    }

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'User not found' })
      };
    }

    if (email) existingUser.email = email.toLowerCase();
    if (username) existingUser.username = username;
    if (firstName) existingUser.firstName = firstName;
    if (lastName) existingUser.lastName = lastName;
    if (role) existingUser.role = role;
    if (isActive !== undefined) existingUser.isActive = isActive;
    
    if (password && password.trim() !== '') {
      existingUser.passwordHash = password;
    }

    existingUser.updatedAt = new Date();

    await existingUser.save();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'User updated successfully' })
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Failed to update user' })
    };
  }
}

exports.handler = withAuth(handler, {
  requireAuth: true,
  requireRole: ['super_admin', 'admin']
});
