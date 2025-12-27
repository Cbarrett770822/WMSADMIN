# WMS User Admin Application

Central user management system for the WMS Tools Suite.

## Features

- **User Management**: Create, edit, delete, and manage user accounts
- **Role Management**: Assign roles (super_admin, admin, user, viewer)
- **App Permissions**: Control access to individual applications
- **Audit Logging**: Track all user activities and system changes
- **Dashboard**: Overview of user statistics and system health

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wms-central?retryWrites=true&w=majority
JWT_SECRET=your-strong-secret-key-change-in-production
```

### 3. Development

```bash
npm run dev
```

The app will run on `http://localhost:3000`

### 4. Build

```bash
npm run build
```

### 5. Deploy to Netlify

```bash
netlify deploy --prod
```

## Default Admin Credentials

- **Email**: admin@wms.com
- **Password**: admin123

**Important**: Change these credentials after first login!

## User Roles

- **super_admin**: Full system access, can manage all users including admins
- **admin**: Can manage users and permissions, limited to assigned apps
- **user**: Standard access to assigned applications
- **viewer**: Read-only access to assigned applications

## Managed Applications

1. **WMS Questionnaire** - Assessment and questionnaire management
2. **ROI Assessment** - ROI calculation and reporting
3. **Dashboard Generator** - AI-powered dashboard creation
4. **Demo Assist** - WMS demo data generation

## Architecture

- **Frontend**: React + Material UI + Vite
- **Backend**: Netlify Functions
- **Database**: MongoDB Atlas
- **Authentication**: JWT with shared auth library

## API Endpoints

- `POST /.netlify/functions/admin-login` - Admin login
- `GET /.netlify/functions/users-list` - List all users
- `POST /.netlify/functions/users-create` - Create new user
- `PUT /.netlify/functions/users-update` - Update user
- `DELETE /.netlify/functions/users-delete` - Delete user
- `PUT /.netlify/functions/permissions-update` - Update app permissions
- `GET /.netlify/functions/admin-stats` - Get dashboard statistics
- `GET /.netlify/functions/audit-logs` - Get audit logs

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- HTTP-only cookies support
- CORS protection
- Audit logging for all actions

## License

ISC
