require('dotenv').config();
const mongoose = require('mongoose');

// Simple User schema inline
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'user', 'viewer'], default: 'user' },
  appPermissions: {
    wmsQuestionnaire: {
      enabled: { type: Boolean, default: false },
      role: { type: String, default: 'user' },
      assignedCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }]
    },
    roiAssessment: {
      enabled: { type: Boolean, default: false },
      role: { type: String, default: 'user' },
      assignedCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }]
    },
    dashboardGenerator: {
      enabled: { type: Boolean, default: false },
      role: { type: String, default: 'user' }
    },
    demoAssist: {
      enabled: { type: Boolean, default: false },
      role: { type: String, default: 'user' }
    }
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  const bcrypt = require('bcryptjs');
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // Check if admin exists
    const existing = await User.findOne({ email: 'admin@wms.com' });
    if (existing) {
      console.log('Admin user already exists!');
      process.exit(0);
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
    console.log('✅ Admin created: admin@wms.com / admin123');

    // Create test user
    const user = new User({
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

    await user.save();
    console.log('✅ Test user created: user@wms.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
