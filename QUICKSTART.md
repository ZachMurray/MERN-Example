# MERN Stack Quick Start Guide

## What's Included

This is a complete, production-ready MERN stack with:
- ✅ Backend: Node.js + Express + MongoDB
- ✅ Frontend: React + Vite + React Router
- ✅ Authentication: JWT-based with secure password hashing
- ✅ Docker: Full containerization with Docker Compose
- ✅ Reuses your existing MongoDB instance

## Fastest Start (Recommended)

```bash
# Navigate to project root
cd c:\Users\zachl\git\Zeitgeist

# Start everything with Docker (auto-checks if 27017 is already in use)
bash ./compose-up.sh

# Wait for all services to start (30-60 seconds)
# Then open http://localhost:3000 in your browser
```

## What's Running

- MongoDB: Existing instance (configured via `MONGODB_URI`)
- Backend API: `localhost:5000`
- Frontend UI: `localhost:3000`

If port `27017` is already in use by an external MongoDB, `compose-up.sh` automatically maps the internal fallback MongoDB to `27018` to prevent startup failure.

## First Login

1. Go to http://localhost:3000
2. Click "Register" to create a new account
3. After registration, you'll be automatically logged in
4. View your profile in the Dashboard

## File Structure Overview

```
Zeitgeist/
├── backend/           - Node.js/Express server
├── frontend/          - React application
├── docker-compose.yml - Container orchestration
└── README.md         - Full documentation
```

## Common Tasks

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Everything
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart backend
```

### Reset Database
```bash
docker-compose down
docker-compose up --build
```

## Development Without Docker

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend (new terminal):
```bash
cd frontend
npm install
npm run dev
```

## Updating JWT Secret (Production)

Edit `docker-compose.yml` and change:
```yaml
JWT_SECRET: your_jwt_secret_key_change_this_in_production
```

To a strong random string, e.g.:
```bash
# Generate on Linux/Mac
openssl rand -base64 32

# On Windows, use any random string generator
```

## Need Help?

Check the main README.md for detailed docs on:
- API endpoints
- Environment variables
- Production deployment
- Troubleshooting

---

Happy coding! 🚀
