# IT Asset Management System (ITAMS)

A modern web application for tracking and managing IT assets within an organization. Built with React, FastAPI, and PostgreSQL.

## Features

- 📊 Interactive dashboard with asset status visualization
- 📝 Asset inventory management (add, edit, delete)
- 👥 Asset issuance and return tracking
- 🔍 Advanced filtering and search capabilities
- 📱 Responsive design for all devices

## Tech Stack

### Frontend
- React with TypeScript
- Chakra UI for components
- Recharts for data visualization
- React Router for navigation
- Axios for API communication

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL database
- JWT authentication (coming soon)

### Infrastructure
- Docker containerization
- Docker Compose for orchestration
- GitHub Actions for CI/CD (coming soon)

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.9+ (for local backend development)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd itams
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Setup

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Project Structure

```
itams/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.tsx      # Main application component
│   │   └── index.tsx    # Application entry point
│   └── package.json     # Frontend dependencies
│
├── backend/              # FastAPI backend application
│   ├── app/
│   │   ├── core/        # Core functionality
│   │   ├── models/      # Database models
│   │   ├── routers/     # API routes
│   │   └── main.py      # Application entry point
│   └── requirements.txt # Backend dependencies
│
└── docker-compose.yml   # Docker configuration
```

## API Documentation

The API documentation is available at http://localhost:8000/docs when running the backend server. It provides detailed information about all available endpoints, request/response schemas, and authentication requirements.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [Recharts](https://recharts.org/) 