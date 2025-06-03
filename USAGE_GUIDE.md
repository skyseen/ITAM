# IT Asset Management System - Usage Guide

## 🚀 Getting Started

### 1. Starting the Application

First, make sure Docker is running on your system, then start the application:

```bash
# Navigate to project directory
cd ITAM

# Start all services (database, backend, frontend)
docker-compose up --build

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Documentation: http://localhost:8000/docs
```

### 2. Seeding the Database with Sample Data

After the application is running, you need to populate the database with sample data including users with encrypted passwords:

```bash
# Open a new terminal and run the seeding script inside the backend container
docker-compose exec backend python seed_data.py

# Or alternatively, run it directly in the backend container:
docker exec -it itam-backend-1 python seed_data.py
```

**Expected Output:**
```
Starting database seeding...
Creating sample users...
Created 8 users
Creating sample assets...
Created 12 assets
Creating sample asset issuances...
Created 4 asset issuances
Creating sample notifications...
Created 3 notifications
Creating sample audit logs...
Created 3 audit logs

==================================================
DATABASE SEEDING COMPLETED SUCCESSFULLY!
==================================================

Sample Login Credentials:
------------------------------
Admin User:
  Username: admin
  Password: admin123

Manager User:
  Username: manager1
  Password: manager123

Regular User:
  Username: user1
  Password: user123

Note: All user passwords are stored encrypted in the database.
You can now access the application at http://localhost:3000
```

## 🔐 Understanding Password Encryption

### How Passwords Are Encrypted

The system uses **bcrypt** for password hashing, which is a secure one-way encryption method:

1. **Plain Text Password** → `admin123`
2. **Bcrypt Hash** → `$2b$12$LQv3c1yqBwEHxPiNW971gOqbdgzdh.vgdMJ8T8jAqVK9sB8zU1aGO`

### Why You Can't Set Passwords Directly in Database

- Passwords are **hashed** (encrypted) using bcrypt with a salt
- The same password creates different hashes each time
- You cannot reverse the hash to get the original password
- Direct database password insertion would not work with the authentication system

### Setting User Passwords Programmatically

If you need to add users with custom passwords, you have several options:

#### Option 1: Modify the Seeding Script

Edit `backend/seed_data.py` and add your users to the `users_data` array:

```python
users_data = [
    {
        "username": "your_username",
        "email": "your_email@company.com", 
        "full_name": "Your Full Name",
        "department": "Your Department",
        "role": UserRole.ADMIN,  # or MANAGER, VIEWER
        "password": "your_password"  # Will be automatically hashed
    },
    # ... existing users
]
```

#### Option 2: Use the API Endpoint

Create users through the API (requires admin privileges):

```bash
# Login to get auth token
curl -X POST "http://localhost:8000/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'

# Use the token to create a new user
curl -X POST "http://localhost:8000/api/v1/users/" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{
       "username": "newuser",
       "email": "newuser@company.com",
       "full_name": "New User",
       "department": "IT",
       "role": "viewer",
       "password": "newpassword123"
     }'
```

#### Option 3: Python Script for Password Hashing

Create a simple script to generate hashed passwords:

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash a password
password = "mypassword123"
hashed = pwd_context.hash(password)
print(f"Hashed password: {hashed}")

# Verify a password
is_valid = pwd_context.verify("mypassword123", hashed)
print(f"Password valid: {is_valid}")
```

## 👤 User Accounts and Roles

### Default User Accounts

After seeding, you'll have these accounts available:

| Username | Password | Role | Department | Access Level |
|----------|----------|------|------------|--------------|
| `admin` | `admin123` | Admin | IT | Full system access |
| `manager1` | `manager123` | Manager | IT | Departmental management |
| `manager2` | `manager123` | Manager | HR | Departmental management |
| `user1` | `user123` | Viewer | Engineering | Read-only access |
| `user2` | `user123` | Viewer | Marketing | Read-only access |
| `user3` | `user123` | Viewer | Finance | Read-only access |
| `user4` | `user123` | Viewer | Engineering | Read-only access |
| `user5` | `user123` | Viewer | Sales | Read-only access |

### Role Permissions

**Admin (`admin`)**:
- Full access to all features
- Can create, edit, and delete assets
- Can manage all users
- Can view all departments' assets
- Can export data and generate reports
- Access to system settings and audit logs

**Manager (`manager1`, `manager2`)**:
- Can manage assets in their department
- Can create and edit assets
- Can issue and return assets
- Can view users in their department
- Limited user management capabilities
- Can export department data

**Viewer (`user1-5`)**:
- Read-only access to assets
- Can view asset information and history
- Can search and filter assets
- Cannot create, edit, or delete assets
- Cannot manage users
- Basic reporting capabilities

## 📊 Using the Application

### 1. Logging In

1. Open http://localhost:3000 in your browser
2. Use any of the credentials from the table above
3. Click "Sign In"

### 2. Dashboard Overview

After logging in, you'll see the dashboard with:
- **Asset Status Distribution**: Visual breakdown of asset statuses
- **Quick Statistics**: Total assets, available, in use, maintenance
- **Recent Activity**: Latest asset issuances and returns
- **Warranty Alerts**: Assets with warranties expiring soon
- **Idle Asset Alerts**: Assets unused for extended periods
- **Department/Type Breakdowns**: Asset distribution charts

### 3. Managing Assets

#### Viewing Assets
- Click "Assets" in the navigation
- Use filters to search by status, type, department
- View detailed asset information
- Export data to CSV

#### Adding New Assets (Admin/Manager only)
- Click "Add Asset" button
- Fill in the comprehensive form:
  - **Basic Info**: Asset ID (auto-generated), type, brand, model
  - **Physical Details**: Serial number, condition, location
  - **Financial Info**: Purchase date, warranty, cost
  - **Organization**: Department, notes
- Click "Create Asset"

#### Editing Assets (Admin/Manager only)
- Find the asset in the list
- Click the three-dot menu → "Edit Asset"
- Update the information
- Click "Update Asset"

#### Asset Operations
- **Issue Asset**: Assign to a user (changes status to "In Use")
- **Return Asset**: Mark as returned (changes status to "Available")
- **Delete Asset**: Permanently remove (Admin only)

### 4. User Management (Admin only)

- Navigate to "Users" section
- View all system users
- Create new users with roles
- Edit user information and permissions
- Deactivate user accounts

### 5. Data Export and Reporting

- Export assets to CSV with current filters applied
- Filter by department, status, type for targeted reports
- View asset history and issuance tracking
- Access audit logs for compliance

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check if database container is running
docker-compose ps

# Restart the database
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

#### 2. Seeding Script Fails
```bash
# Make sure backend container is running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Run seeding script with verbose output
docker-compose exec backend python -u seed_data.py
```

#### 3. Login Issues
- Ensure you're using the correct credentials from the seeding output
- Check that the database was properly seeded
- Verify the backend is running on port 8000

#### 4. Permission Denied Errors
- Make sure you're logged in with appropriate role
- Admin functions require admin account
- Some features are role-restricted

### Resetting the Database

If you need to start fresh:

```bash
# Stop all services
docker-compose down

# Remove database volume (WARNING: This deletes all data)
docker volume rm itam_postgres_data

# Start services and re-seed
docker-compose up --build
docker-compose exec backend python seed_data.py
```

## 📈 Sample Data Overview

The seeding script creates realistic sample data:

### Assets Created
- **Laptops**: Dell XPS 13, MacBook Pro 14, Lenovo ThinkPad X1, HP EliteBook 840
- **Monitors**: Samsung 27" Curved, LG UltraWide 34", Dell UltraSharp 24"
- **Desktops**: HP EliteDesk 800
- **Printers**: Canon ImageCLASS MF445dw
- **Network Equipment**: Cisco ISR 4331 Router
- **Servers**: Dell PowerEdge R740

### Asset Statuses
- Some assets are **Available** (ready for assignment)
- Some assets are **In Use** (assigned to users)
- Some assets are **Under Maintenance** (being repaired)
- Some assets are **Retired** (end of life)

### Realistic Scenarios
- Assets with warranties expiring soon (triggers alerts)
- Assets that have been idle (triggers notifications)
- Complete issuance history showing asset utilization
- Audit logs demonstrating system activity

## 🚀 Next Steps

1. **Explore the Dashboard**: Familiarize yourself with the visual indicators
2. **Test Different User Roles**: Login with different accounts to see permission differences
3. **Try Asset Operations**: Create, edit, issue, and return assets
4. **Export Data**: Generate CSV reports with different filters
5. **Review Audit Logs**: Understand the system's tracking capabilities

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review the main README.md for detailed setup instructions
3. Check Docker container logs for error messages
4. Ensure all prerequisites are properly installed

---

**Ready to manage your IT assets efficiently!** 🎯 