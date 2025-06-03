# IT Asset Management System - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### 1. Access the System
1. Open your web browser
2. Go to: **http://localhost:3000**
3. You'll see the login screen

### 2. Login with Default Accounts

| Username | Password | Role | What You Can Do |
|----------|----------|------|-----------------|
| `admin` | `admin123` | Admin | Everything - manage users, all assets, reports |
| `manager1` | `manager123` | Manager | Manage IT department assets, assign/return |
| `user1` | `user123` | Viewer | View assets, basic reports |

### 3. Try These Features

#### As Admin (`admin` / `admin123`):
1. **Dashboard**: See overview of all 12 sample assets
2. **Assets**: View, create, edit, assign assets to users
3. **Users**: Manage user accounts and permissions
4. **Reports**: Export asset data to CSV

#### As Manager (`manager1` / `manager123`):
1. **Dashboard**: See IT department overview
2. **Assets**: Manage IT department assets only
3. **Issue Assets**: Assign laptops/equipment to users
4. **Return Assets**: Process equipment returns

#### As Viewer (`user1` / `user123`):
1. **Dashboard**: View basic metrics
2. **Assets**: Browse available equipment
3. **Reports**: View basic asset information

### 4. Common Tasks

#### Assign a Laptop to a User
1. Login as `admin` or `manager1`
2. Go to **Assets** page
3. Find an **Available** laptop (e.g., LAP-001)
4. Click the **three dots** menu → **Issue to User**
5. Select a user from dropdown
6. Add notes if needed
7. Click **Issue Asset**

#### Add a New Asset
1. Login as `admin` or `manager1`
2. Go to **Assets** page
3. Click **Add New Asset** button
4. Fill in required fields:
   - Type: Select from dropdown
   - Brand: e.g., "Apple"
   - Model: e.g., "MacBook Pro 16"
   - Department: Your department
   - Purchase Date: When bought
   - Warranty Expiry: End of warranty
5. Click **Create Asset**

#### Export Asset Report
1. Go to **Assets** page
2. Use filters to narrow down data (optional)
3. Click **Export CSV** button
4. Download will start automatically

### 5. Sample Data Overview

**Users (8 total)**:
- 1 Admin (admin)
- 2 Managers (manager1, manager2)
- 5 Viewers (user1-user3, john.doe, jane.smith)

**Assets (12 total)**:
- 3 Laptops (Dell XPS, MacBook Pro, HP EliteBook)
- 2 Monitors (LG 27", Samsung 24")
- 2 Desktops (HP EliteDesk, Dell OptiPlex)
- 2 Printers (HP LaserJet, Canon Pixma)
- 2 Servers (Dell PowerEdge, HP ProLiant)
- 1 Router (Cisco ISR)

**Asset Assignments (4 active)**:
- john.doe has Dell XPS 13 laptop
- jane.smith has LG 27" monitor
- bob.wilson has HP EliteDesk desktop
- alice.cooper has Samsung 24" monitor

### 6. Navigation Tips

- **Dashboard**: Main overview page (home icon)
- **Assets**: Asset management (laptop icon)
- **Users**: User management (people icon) - Admin only
- **Profile**: Your account settings (username in top-right)
- **Logout**: Click username → Logout

### 7. Key Features

#### Dashboard Features
- **Asset Statistics**: Total, Available, In Use, Maintenance counts
- **Status Chart**: Visual breakdown of asset statuses
- **Recent Activity**: Latest asset assignments
- **Alerts**: Warranty expiration warnings
- **Department Distribution**: Assets per department

#### Asset Management Features
- **Search & Filter**: Find assets by ID, brand, model, status
- **Pagination**: Browse large asset lists efficiently
- **Status Management**: Available, In Use, Maintenance, Retired
- **Assignment Tracking**: Who has what, when issued
- **Warranty Monitoring**: Expiration alerts and tracking
- **Export**: CSV download for reporting

#### Security Features
- **Role-based Access**: Admin, Manager, Viewer permissions
- **Department Restrictions**: Managers see only their department
- **Session Management**: 30-minute timeout for security
- **Encrypted Passwords**: bcrypt security for all accounts
- **Audit Trail**: Track all system changes

### 8. Troubleshooting

#### Can't Login?
- Double-check username and password (case-sensitive)
- Try `admin` / `admin123` (most common test account)
- Clear browser cache if having issues
- Make sure Docker containers are running

#### Not Seeing Assets?
- Check if filters are applied (clear them)
- Managers only see their department's assets
- Viewers have limited access
- Try logging in as `admin` for full access

#### Performance Issues?
- Use search/filters to reduce data loading
- Close unnecessary browser tabs
- Check Docker container status: `docker-compose ps`

### 9. Next Steps

1. **Read Full Manual**: See `USER_MANUAL.md` for complete documentation
2. **Customize Data**: Add your real assets and users
3. **Configure Departments**: Update for your organization
4. **Set Policies**: Define asset assignment rules
5. **Train Users**: Share login credentials and basic training

### 10. System Management

#### Stop the System
```bash
docker-compose down
```

#### Start the System
```bash
docker-compose up -d
```

#### View Logs
```bash
docker-compose logs -f
```

#### Reset Database (Fresh Start)
```bash
docker-compose down -v
docker-compose up -d
# Wait 30 seconds, then:
docker-compose exec backend python seed_data.py
```

---

## 🎯 Success Checklist

- [ ] Can access http://localhost:3000
- [ ] Can login with `admin` / `admin123`
- [ ] Dashboard shows asset statistics
- [ ] Can view asset list
- [ ] Can add a new asset
- [ ] Can assign an asset to a user
- [ ] Can export CSV report
- [ ] Can logout and login as different user

---

**Need Help?** Check the full `USER_MANUAL.md` for comprehensive documentation or contact your system administrator.

**System is Working!** 🎉 You now have a fully functional IT Asset Management System with sample data, user authentication, and all core features operational. 