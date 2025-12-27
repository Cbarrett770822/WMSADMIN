require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { hashPassword } = require('../src/utils/password');

async function initDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@wms.com' });
    
    if (existingAdmin) {
      console.log('Super admin already exists');
      return;
    }

    // Create super admin user
    console.log('Creating super admin user...');
    const superAdmin = new User({
      email: 'admin@wms.com',
      username: 'admin',
      passwordHash: 'admin123', // Will be hashed by pre-save hook
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      isActive: true,
      appPermissions: {
        wmsQuestionnaire: {
          enabled: true,
          role: 'admin',
          assignedCompanies: []
        },
        roiAssessment: {
          enabled: true,
          role: 'admin',
          assignedCompanies: []
        },
        dashboardGenerator: {
          enabled: true,
          role: 'admin'
        },
        demoAssist: {
          enabled: true,
          role: 'admin'
        }
      }
    });

    await superAdmin.save();
    console.log('Super admin created successfully');
    console.log('Email: admin@wms.com');
    console.log('Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change these credentials after first login!');

    // Create a test user
    console.log('\nCreating test user...');
    const testUser = new User({
      email: 'user@wms.com',
      username: 'testuser',
      passwordHash: 'user123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isActive: true,
      appPermissions: {
        wmsQuestionnaire: {
          enabled: true,
          role: 'user',
          assignedCompanies: []
        },
        roiAssessment: {
          enabled: true,
          role: 'user',
          assignedCompanies: []
        },
        dashboardGenerator: {
          enabled: false,
          role: 'user'
        },
        demoAssist: {
          enabled: false,
          role: 'user'
        }
      }
    });

    await testUser.save();
    console.log('Test user created successfully');
    console.log('Email: user@wms.com');
    console.log('Password: user123');

    console.log('\n✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

initDatabase();
