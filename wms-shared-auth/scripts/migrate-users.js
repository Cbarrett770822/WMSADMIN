require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function migrateUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Migrating existing users to new schema...');

    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      let updated = false;

      // Add appPermissions if missing
      if (!user.appPermissions) {
        user.appPermissions = {
          wmsQuestionnaire: {
            enabled: true,
            role: user.role === 'admin' ? 'admin' : 'user',
            assignedCompanies: user.company ? [user.company] : []
          },
          roiAssessment: {
            enabled: true,
            role: user.role === 'admin' ? 'admin' : 'user',
            assignedCompanies: user.assignedCompanies || []
          },
          dashboardGenerator: {
            enabled: false,
            role: 'user'
          },
          demoAssist: {
            enabled: false,
            role: 'user'
          }
        };
        updated = true;
      }

      // Ensure username exists
      if (!user.username) {
        user.username = user.email.split('@')[0];
        updated = true;
      }

      // Ensure firstName and lastName exist
      if (!user.firstName || !user.lastName) {
        const nameParts = (user.name || user.email).split(' ');
        user.firstName = user.firstName || nameParts[0] || 'User';
        user.lastName = user.lastName || nameParts.slice(1).join(' ') || 'Name';
        updated = true;
      }

      // Rename password to passwordHash if needed
      if (user.password && !user.passwordHash) {
        user.passwordHash = user.password;
        user.password = undefined;
        updated = true;
      }

      if (updated) {
        await user.save();
        console.log(`✓ Migrated user: ${user.email}`);
      } else {
        console.log(`- User already migrated: ${user.email}`);
      }
    }

    console.log('\n✅ User migration completed successfully!');
  } catch (error) {
    console.error('Error migrating users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

migrateUsers();
