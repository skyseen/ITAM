# IT Asset Management System (ITAMS) - Requirements

## 1. Objective

To build a customizable IT Asset Management System for internal use to track and manage company IT equipment such as laptops, monitors, peripherals, etc.

The system must provide:
- A **dashboard** with clear **visual indicators** of asset status
- Real-time tracking of **asset issuance and availability**
- Support for **custom fields** and **expansion**
- User-friendly interface for both IT admins and department users

---

## 2. Core Features

### 2.1 Dashboard
- Status summary of all assets:
  - **In Use**
  - **Available**
  - **Under Maintenance**
  - **Retired**
- Visual indicators:
  - Pie chart / bar graph of asset usage
  - Count of total assets, issued assets, and available assets
- Quick filter options:
  - By department, asset type, status, location

### 2.2 Asset Inventory
- Add/edit/delete assets with metadata:
  - Asset ID
  - Type (e.g., laptop, monitor)
  - Brand/model
  - Assigned user (if any)
  - Department
  - Purchase date
  - Warranty expiry
  - Current status (dropdown)

### 2.3 Issuance Tracking
- Issue an asset to a user (name, department, date)
- Return asset to inventory
- View asset issuance history

### 2.4 Notifications (Optional)
- Alert for upcoming warranty expiration
- Flag idle assets (not used >30 days)

---

## 3. Tech Stack Suggestions

| Layer            | Suggested Stack                    |
|------------------|------------------------------------|
| Frontend         | React + Chart.js / D3.js           |
| Backend API      | Node.js / FastAPI / Express        |
| Database         | PostgreSQL / MongoDB               |
| Auth             | JWT-based auth, basic RBAC         |
| Deployment       | Docker + CI/CD via GitHub Actions  |
| Hosting          | Internal server / Cloud VPS        |

---

## 4. Customization Notes
- Modular design to support additional fields (e.g., asset location, condition)
- Export data to Excel or CSV
- REST API support for integration with HR or procurement systems
- Role-based access (Admin, Manager, Viewer)

---

## 5. Future Improvements (Optional Ideas)
- Asset request workflow (approval process)
- Integration with Active Directory for user info

---

## 6. Acceptance Criteria

- ✅ Dashboard shows real-time asset status with charts
- ✅ Admin can add/edit/delete assets
- ✅ Users can view and request assets
- ✅ Issuance and return flows are working
- ✅ System is responsive and secure# IT Asset Management System (ITAMS) - Requirements


## 7. Git Integration Requirement

This project must use **Git for version control**, and Cursor should assist with:
- Initializing Git repository
- Generating a `.gitignore` file tailored for the following stack(necessary):
  - macOS
  - Python (FastAPI)
  - Node.js / React
  - Docker
  - VS Code or JetBrains IDEs
- Ensuring sensitive files like `.env`, system folders, and build artifacts are excluded

---