# IT Asset Management System (ITAMS)

A comprehensive web-based solution for tracking and managing IT assets within an organization. Built with modern technologies to provide real-time asset tracking, user management, and detailed reporting capabilities.

![ITAMS Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## 🚀 Features

### ✅ Core Functionality
- **📊 Interactive Dashboard** - Real-time asset status visualization with charts and metrics
- **📝 Asset Inventory Management** - Complete CRUD operations for IT assets
- **👥 User Management** - Role-based access control (Admin, Manager, Viewer)
- **🔄 Asset Issuance Tracking** - Track asset assignments and returns with full history
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

### ✅ Advanced Features
- **🔍 Advanced Search & Filtering** - Find assets by type, department, status, or custom criteria
- **📈 Dashboard Analytics** - Visual insights with pie charts, bar graphs, and status summaries
- **⚠️ Smart Notifications** - Automated alerts for warranty expiration and idle assets
- **📋 Export Capabilities** - Export asset data to CSV for reporting and analysis
- **🔐 JWT Authentication** - Secure login with role-based permissions
- **📝 Audit Logging** - Complete activity tracking for compliance and security

### ✅ Requirements Compliance
- **Visual Indicators** - Clear status representation with charts and color coding
- **Real-time Tracking** - Live updates of asset availability and assignments
- **Custom Fields Support** - Extensible data model for organization-specific needs
- **User-friendly Interface** - Intuitive design for both IT admins and end users
- **Department Management** - Multi-department asset organization and filtering
- **Warranty Management** - Track warranty expiration with proactive alerts

## 🏗️ Architecture & Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Chakra UI** for modern, accessible component library
- **React Router** for client-side navigation
- **Axios** for API communication
- **Context API** for state management

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - Powerful ORM for database operations
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication and authorization
- **Bcrypt** - Password hashing for security

### Infrastructure
- **Docker & Docker Compose** - Containerized deployment
- **CORS** configured for secure cross-origin requests
- **Environment-based configuration** for different deployment stages

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Docker Desktop** (recommended) - [Download here](https://www.docker.com/products/docker-desktop/)
- **OR** for local development:
  - Python 3.9+ - [Download here](https://python.org/downloads/)
  - Node.js 18+ - [Download here](https://nodejs.org/)
  - PostgreSQL 13+ - [Download here](https://postgresql.org/download/)

## 🚀 Quick Start Guide

### Option 1: Docker Compose (Recommended)

This is the fastest way to get the application running with all dependencies.

```bash
# 1. Clone the repository
git clone <repository-url>
cd itams

# 2. Start the application
docker-compose up --build

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development Setup

For developers who want to run services locally for debugging and development.

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up database (PostgreSQL must be running)
# Update DATABASE_URL in app/core/config.py if needed

# Start the backend server
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### 🗄️ Database Setup & Sample Data

After starting the application, you can populate it with sample data:

```bash
# Navigate to backend directory
cd backend

# Run the seeding script
python seed_data.py
```

This will create:
- **8 sample users** with different roles (admin, managers, viewers)
- **12 sample assets** (laptops, monitors, desktops, printers, servers, network equipment)
- **Asset issuances** showing realistic usage patterns
- **Notifications** for warranty expiration and idle assets
- **Audit logs** demonstrating system activity tracking

#### 🔑 Default Login Credentials

After seeding, you can log in with these accounts:

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Admin | `admin` | `admin123` | Full system access |
| Manager | `manager1` | `manager123` | Department management |
| Viewer | `user1` | `user123` | Read-only access |

> **Note**: All passwords are securely hashed using bcrypt before storage.

## 📖 User Guide

### 🔐 Authentication & Roles

The system supports three user roles with different permissions:

- **Admin**: Full system access - manage all assets, users, and system settings
- **Manager**: Department-level access - manage assets and users within their department
- **Viewer**: Read-only access - view assets and basic operations only

### 📊 Dashboard Overview

The dashboard provides a comprehensive overview of your IT assets:

- **Asset Status Distribution** - Pie chart showing available, in-use, maintenance, and retired assets
- **Asset Type Breakdown** - Bar chart displaying asset counts by category
- **Department Distribution** - Visual representation of asset allocation across departments
- **Recent Activity** - Latest asset issuances and returns
- **Warranty Alerts** - Assets with warranties expiring soon
- **Idle Asset Alerts** - Assets that haven't been used recently

### 📝 Asset Management

#### Adding New Assets
1. Navigate to **Assets > Add New Asset**
2. Fill in required information:
   - Asset ID (unique identifier)
   - Type, Brand, Model
   - Department and Location
   - Purchase Date and Warranty Information
   - Additional notes and condition

#### Managing Existing Assets
- **View Assets**: Browse paginated asset list with search and filtering
- **Edit Assets**: Update asset information (Admin/Manager only)
- **Issue Assets**: Assign assets to users with tracking
- **Return Assets**: Process asset returns and update status
- **Asset History**: View complete issuance history for each asset

### 👥 User Management (Admin Only)

- **Create Users**: Add new system users with appropriate roles
- **Edit Users**: Update user information and permissions
- **Manage Departments**: Organize users by department
- **Password Management**: Secure password update functionality

### 📈 Reporting & Export

- **Export to CSV**: Download asset data for external analysis
- **Filtering Options**: Filter by status, department, type, or custom criteria
- **Search Functionality**: Quick search across asset IDs, brands, models, and serial numbers

## 🔧 API Documentation

The API is fully documented with OpenAPI/Swagger. When the backend is running, visit:

- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/refresh` - Refresh access token

#### Assets
- `GET /api/v1/assets/` - List assets with filtering
- `POST /api/v1/assets/` - Create new asset
- `PUT /api/v1/assets/{id}` - Update asset
- `DELETE /api/v1/assets/{id}` - Delete asset
- `POST /api/v1/assets/{id}/issue` - Issue asset to user
- `POST /api/v1/assets/{id}/return` - Return asset
- `GET /api/v1/assets/dashboard` - Dashboard data
- `GET /api/v1/assets/export/csv` - Export assets

#### Users
- `GET /api/v1/users/` - List users
- `POST /api/v1/users/` - Create user
- `PUT /api/v1/users/{id}` - Update user
- `PUT /api/v1/users/{id}/password` - Update password

## 🛠️ Configuration

### Environment Variables

The application can be configured using environment variables:

#### Backend Configuration
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Security
SECRET_KEY=your-secret-key-for-jwt
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
DEBUG=false
APP_NAME="IT Asset Management System"

# Notifications
WARRANTY_ALERT_DAYS=30
IDLE_ASSET_DAYS=30
```

#### Frontend Configuration
```bash
# API URL
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### Database Configuration

The system uses PostgreSQL by default. To use a different database:

1. Update the `DATABASE_URL` in `backend/app/core/config.py`
2. Install appropriate database drivers in `requirements.txt`
3. Update Docker Compose configuration if using containers

## 🧪 Development & Testing

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality

The project follows these standards:
- **Python**: PEP 8 style guide with type hints
- **TypeScript**: Strict type checking enabled
- **Comments**: Comprehensive documentation throughout
- **Error Handling**: Proper exception handling and user feedback

### Adding Custom Fields

The system is designed to be extensible. To add custom fields:

1. Update the database models in `backend/app/models/models.py`
2. Create database migration using Alembic
3. Update API schemas in the router files
4. Add corresponding frontend form fields

## 🚀 Deployment

### Production Deployment

For production deployment:

1. **Environment Configuration**:
   ```bash
   # Set production environment variables
   DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/itams_prod
   SECRET_KEY=secure-production-secret-key
   DEBUG=false
   ```

2. **Docker Production**:
   ```bash
   # Build and run with production settings
   docker-compose -f docker-compose.prod.yml up --build
   ```

3. **Database Migration**:
   ```bash
   # Run database migrations
   cd backend
   alembic upgrade head
   ```

### Security Considerations

- **JWT Tokens**: Use strong secret keys and appropriate expiration times
- **Database**: Use secure connection strings and limited database users
- **CORS**: Configure allowed origins for production
- **HTTPS**: Use SSL/TLS in production environments
- **Environment Variables**: Never commit sensitive data to version control

## 🐛 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Permission denied (macOS/Linux)
sudo chown -R $USER:$USER .

# Port already in use
docker-compose down
sudo lsof -i :3000  # Check what's using the port
sudo lsof -i :8000
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Reset database
docker-compose down -v  # WARNING: This deletes all data
docker-compose up --build
```

#### Frontend Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### API Authentication Issues
- Check if JWT token is valid
- Verify user credentials in database
- Check CORS configuration for cross-origin requests

### Getting Help

If you encounter issues:

1. **Check the logs**: Use `docker-compose logs [service]` to view service logs
2. **Review documentation**: Ensure all prerequisites are met
3. **Verify configuration**: Check environment variables and database connections
4. **Database state**: Ensure the database is properly seeded with sample data

## 📈 Monitoring & Maintenance

### Health Checks

The application provides health check endpoints:
- Backend: `GET /health`
- Database connectivity is automatically verified

### Backup Recommendations

- **Database**: Regular PostgreSQL backups using `pg_dump`
- **Application**: Version control with Git
- **Assets**: Consider backing up any uploaded files or attachments

### Performance Optimization

- **Database Indexing**: Indexes are configured on frequently queried fields
- **API Pagination**: Large datasets are paginated for better performance
- **Frontend Optimization**: React components are optimized for rendering performance

## 🤝 Contributing

We welcome contributions to improve ITAMS:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add comprehensive comments for new features
- Include tests for new functionality
- Update documentation as needed

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Documentation**: Review this README and API docs
- **Issues**: Create GitHub issues for bugs or feature requests
- **Development**: Check the contributing guidelines for development setup

---

**Built with ❤️ for efficient IT asset management** 