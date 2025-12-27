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

    const { userId } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'User ID is required' })
      };
    }

    const userToDelete = await User.findById(userId);

    if (!userToDelete) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'User not found' })
      };
    }

    if (userToDelete.role === 'super_admin' && user.role !== 'super_admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Cannot delete super admin user' })
      };
    }

    await User.findByIdAndDelete(userId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'User deleted successfully' })
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Failed to delete user' })
    };
  }
}

exports.handler = withAuth(handler, {
  requireAuth: true,
  requireRole: ['super_admin', 'admin']
});
