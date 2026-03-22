# MERN Stack with JWT Authentication & Docker Deployment

A complete MongoDB, Express, React, Node.js (MERN) stack application featuring JWT-based authentication and containerized deployment with Docker.

## Project Structure

```
.
├── backend/              # Node.js + Express server
│   ├── config/
│   │   └── database.js   # MongoDB connection
│   ├── middleware/
│   │   └── auth.js       # JWT authentication middleware
│   ├── models/
│   │   └── User.js       # User schema
│   ├── routes/
│   │   ├── auth.js       # Register & login endpoints
│   │   └── protected.js  # Protected routes (profile, etc.)
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
├── frontend/             # React app (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── authService.js  # Axios + API calls
│   │   ├── styles/
│   │   │   ├── Auth.css
│   │   │   └── Dashboard.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
└── docker-compose.yml    # Orchestrate all services
```

## Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (for local development without Docker)
- npm or yarn

## Quick Start with Docker

### 1. Clone or Navigate to Project

```bash
cd /path/to/Zeitgeist
```

### 2. Build and Run with Docker Compose

```bash
docker-compose up --build
```

This will:
- Build the backend Docker image
- Build the frontend Docker image
- Connect backend to your existing MongoDB instance
- Start backend server (port 5000)
- Start frontend application (port 3000)

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: existing instance specified by `MONGODB_URI`

## Local Development (Without Docker)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update MONGODB_URI in .env for local MongoDB
# MONGODB_URI=mongodb://localhost:27017/mern-auth

# Start development server
npm run dev
# or npm start for production
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Keep VITE_API_URL as http://localhost:5000/api

# Start development server
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

### Protected Routes

- `GET /api/protected/profile` - Get user profile (requires JWT token)
  - Header: `Authorization: Bearer <token>`

## Features

✅ User Registration with validation
✅ JWT-based Authentication
✅ Protected Routes
✅ Secure Password Hashing (bcrypt)
✅ MongoDB Integration
✅ React Router Navigation
✅ Axios HTTP Client with Interceptors
✅ Responsive UI Design
✅ Docker Containerization
✅ Docker Compose Orchestration
✅ Health Checks
✅ Development & Production Ready

## Environment Variables

### Backend (.env)

```env
MONGODB_URI=mongodb://host.docker.internal:27017/mern-auth
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## Production Deployment

### Docker Compose Production

1. Update `.env` variables with production values
2. Update `JWT_SECRET` to a strong random string
3. Run: `docker-compose -f docker-compose.yml up -d`

### Production Checklist

- [ ] Change `JWT_SECRET` to secure random value
- [ ] Set `NODE_ENV=production` in backend
- [ ] Update `CLIENT_URL` for frontend domain
- [ ] Configure MongoDB with proper authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment variables for production

## Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start services (if already built)
docker-compose up

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild specific service
docker-compose up --build backend

# Stop services
docker-compose down
```

## Technology Stack

- **Frontend**: React 18, Vite, React Router, Axios
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Containerization**: Docker, Docker Compose

## Security Notes

- Passwords are hashed using bcryptjs with 10 salt rounds
- JWT tokens expire after 7 days (configurable)
- CORS is enabled for frontend communication
- Protected routes require valid JWT token
- Input validation using express-validator

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB container is running: `docker-compose logs mongodb`
- Check MongoDB credentials in docker-compose.yml

### Port Already in Use
- Change ports in docker-compose.yml
- Or kill process using the port: `lsof -i :5000` / `kill -9 <PID>`

### Frontend Can't Connect to Backend
- Check VITE_API_URL in frontend/.env
- Ensure backend service is running: `docker-compose ps`
- Check network connectivity: `docker network ls`

## Development Tips

1. **Hot Reload**: Frontend uses Vite (automatic hot reload on save)
2. **Backend Reload**: Use `npm run dev` for nodemon
3. **Database Persistence**: MongoDB data is stored in `mongodb_data` volume
4. **Logs**: Use `docker-compose logs -f` to debug

## Next Steps

- Add refresh token mechanism
- Implement role-based access control (RBAC)
- Add email verification
- Implement password reset functionality
- Add user profile editing
- Set up CI/CD pipeline

## License

ISC

## Support

For issues or questions, check Docker Compose docs:
- https://docs.docker.com/compose/
- https://docs.docker.com/

