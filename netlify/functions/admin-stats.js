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

    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const newThisMonth = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } });

    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const roleStats = {};
    roleDistribution.forEach(item => {
      roleStats[item._id] = item.count;
    });

    const appAccess = {
      wmsQuestionnaire: await User.countDocuments({ 'appPermissions.wmsQuestionnaire.enabled': true }),
      roiAssessment: await User.countDocuments({ 'appPermissions.roiAssessment.enabled': true }),
      dashboardGenerator: await User.countDocuments({ 'appPermissions.dashboardGenerator.enabled': true }),
      demoAssist: await User.countDocuments({ 'appPermissions.demoAssist.enabled': true })
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalUsers,
        activeUsers,
        inactiveUsers,
        newThisMonth,
        roleDistribution: roleStats,
        appAccess
      })
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Failed to fetch statistics' })
    };
  }
}

exports.handler = withAuth(handler, {
  requireAuth: true,
  requireRole: ['super_admin', 'admin']
});
