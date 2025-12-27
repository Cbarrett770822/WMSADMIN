const { withAuth } = require('../../../../wms-shared-auth/src/middleware/withAuth');
const { connectToDatabase } = require('../../../../wms-shared-auth/src/utils/db');
const User = require('../../../../wms-shared-auth/src/models/User');

async function handler(event, context, user) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    await connectToDatabase();

    const { userId, appPermissions } = JSON.parse(event.body);

    if (!userId || !appPermissions) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'User ID and app permissions are required' })
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

    existingUser.appPermissions = appPermissions;
    existingUser.updatedAt = new Date();

    await existingUser.save();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Permissions updated successfully' })
    };
  } catch (error) {
    console.error('Error updating permissions:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Failed to update permissions' })
    };
  }
}

exports.handler = withAuth(handler, {
  requireAuth: true,
  requireRole: ['super_admin', 'admin']
});
