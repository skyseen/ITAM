# IT Asset Management System (ITAMS)

A comprehensive IT asset management system for tracking and managing company IT equipment.

## Features

- 📊 Interactive dashboard with visual asset status indicators
- 📝 Complete asset inventory management
- 👥 User and department-based asset tracking
- 🔔 Automated notifications for warranty and maintenance
- 🔒 Role-based access control
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Authentication**: JWT-based auth
- **Containerization**: Docker
- **Charts**: Chart.js

## Project Structure

```
itams/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core functionality
│   │   ├── models/         # Database models
│   │   └── schemas/        # Pydantic schemas
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json       # Node dependencies
└── docker/                # Docker configuration
    ├── backend/
    ├── frontend/
    └── docker-compose.yml
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- Docker and Docker Compose
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd itams
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

4. Start the development servers:
   ```bash
   # Backend
   cd backend
   uvicorn app.main:app --reload

   # Frontend
   cd frontend
   npm start
   ```

## Development

- Backend API documentation will be available at `http://localhost:8000/docs`
- Frontend development server runs at `http://localhost:3000`

## License

This project is licensed under the MIT License - see the LICENSE file for details. 