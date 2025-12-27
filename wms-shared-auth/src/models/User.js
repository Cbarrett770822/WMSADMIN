const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'user', 'viewer'],
    default: 'user',
    index: true
  },
  
  // App-specific permissions
  appPermissions: {
    wmsQuestionnaire: {
      enabled: { type: Boolean, default: false },
      role: { type: String, enum: ['admin', 'user', 'viewer'], default: 'user' },
      assignedCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }]
    },
    roiAssessment: {
      enabled: { type: Boolean, default: false },
      role: { type: String, enum: ['admin', 'user', 'viewer'], default: 'user' },
      assignedCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }]
    },
    dashboardGenerator: {
      enabled: { type: Boolean, default: false },
      role: { type: String, enum: ['admin', 'user', 'viewer'], default: 'user' }
    },
    demoAssist: {
      enabled: { type: Boolean, default: false },
      role: { type: String, enum: ['admin', 'user', 'viewer'], default: 'user' }
    }
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'appPermissions.wmsQuestionnaire.enabled': 1 });
userSchema.index({ 'appPermissions.roiAssessment.enabled': 1 });
userSchema.index({ 'appPermissions.dashboardGenerator.enabled': 1 });
userSchema.index({ 'appPermissions.demoAssist.enabled': 1 });

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  // Only hash if it's not already hashed (bcrypt hashes start with $2)
  if (!this.passwordHash.startsWith('$2')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to check if user has access to an app
userSchema.methods.hasAppAccess = function(appName) {
  if (!this.isActive) return false;
  if (this.role === 'super_admin') return true;
  
  const appKey = appName.replace(/-/g, '');
  const appPermission = this.appPermissions[appKey];
  return appPermission && appPermission.enabled;
};

// Method to get app role
userSchema.methods.getAppRole = function(appName) {
  const appKey = appName.replace(/-/g, '');
  const appPermission = this.appPermissions[appKey];
  return appPermission ? appPermission.role : null;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
