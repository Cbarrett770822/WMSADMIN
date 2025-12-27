# WMS Shared Authentication Library

Centralized authentication library for the WMS Tools Suite.

## Installation

```bash
npm install
```

## Environment Variables

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wms-central?retryWrites=true&w=majority
JWT_SECRET=your-strong-secret-key-here
```

## Usage

### Import the library

```javascript
const {
  User,
  generateToken,
  verifyToken,
  connectToDatabase,
  withAuth
} = require('wms-shared-auth');
```

### User Model

```javascript
// Create a new user
const user = new User({
  email: 'user@example.com',
  username: 'johndoe',
  passwordHash: 'plainPassword123', // Will be hashed automatically
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  appPermissions: {
    wmsQuestionnaire: {
      enabled: true,
      role: 'user',
      assignedCompanies: []
    }
  }
});

await user.save();

// Compare password
const isValid = await user.comparePassword('plainPassword123');

// Check app access
const hasAccess = user.hasAppAccess('wms-questionnaire');
```

### JWT Utilities

```javascript
// Generate token
const token = generateToken(user);

// Verify token
const decoded = verifyToken(token);

// Extract from header
const token = extractTokenFromHeader('Bearer eyJhbGc...');
```

### Database Connection

```javascript
await connectToDatabase();
```

### Middleware

```javascript
// Netlify Function with auth
const { withAuth } = require('wms-shared-auth');

exports.handler = withAuth(async (event, context, user) => {
  // user is null if not authenticated
  // user contains decoded token payload if authenticated
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success', user })
  };
}, {
  requireAuth: true,
  requireRole: 'admin',
  requireApp: 'wms-questionnaire'
});
```

## User Schema

```javascript
{
  email: String (unique, required),
  username: String (unique, required),
  passwordHash: String (required),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: ['super_admin', 'admin', 'user', 'viewer']),
  
  appPermissions: {
    wmsQuestionnaire: {
      enabled: Boolean,
      role: String,
      assignedCompanies: [ObjectId]
    },
    roiAssessment: {
      enabled: Boolean,
      role: String,
      assignedCompanies: [ObjectId]
    },
    dashboardGenerator: {
      enabled: Boolean,
      role: String
    },
    demoAssist: {
      enabled: Boolean,
      role: String
    }
  },
  
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  metadata: Object
}
```

## App Names

- `wms-questionnaire` → `wmsQuestionnaire`
- `roi-assessment` → `roiAssessment`
- `dashboard-generator` → `dashboardGenerator`
- `demo-assist` → `demoAssist`

## License

ISC
