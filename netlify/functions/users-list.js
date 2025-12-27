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

    const users = await User.find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(users)
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Failed to fetch users' })
    };
  }
}

exports.handler = withAuth(handler, {
  requireAuth: true,
  requireRole: ['super_admin', 'admin']
});
