# Backend API - MERN Authentication Server

Express.js + MongoDB backend with JWT authentication.

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update MONGODB_URI to local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/mern-auth

# Start with nodemon (auto-reload on changes)
npm run dev

# Server runs on http://localhost:5000
```

### Production

```bash
npm start
```

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response (201):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Protected Endpoints

#### Get User Profile
```
GET /api/protected/profile
Headers:
  Authorization: Bearer <your_jwt_token>

Response (200):
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Health Check
```
GET /health

Response (200):
{
  "message": "Server is running"
}
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   └── User.js              # User schema & methods
├── routes/
│   ├── auth.js              # Authentication routes
│   └── protected.js         # Protected/private routes
├── .env.example
├── Dockerfile
├── server.js                # Express app setup
└── package.json
```

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/mern-auth

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:3000
```

## Authentication Flow

1. **Register**: User creates account with username, email, password
   - Password is hashed with bcryptjs (10 salt rounds)
   - User record saved to MongoDB
   - JWT token generated and returned

2. **Login**: User provides email and password
   - Email lookup in database
   - Password compared with stored hash
   - JWT token generated on success

3. **Protected Routes**: Token validated on each request
   - Token extracted from `Authorization: Bearer <token>` header
   - Token verified with JWT_SECRET
   - User ID decoded and attached to request object

## Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Configurable token expiration (default 7 days)
- ✅ CORS protection
- ✅ Input validation with express-validator
- ✅ HTTP error handling
- ✅ Secure headers

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT generation & verification
- **dotenv** - Environment variables
- **cors** - CORS middleware
- **express-validator** - Input validation

## Development

```bash
# Run with automatic reload
npm run dev

# Run production server
npm start

# View logs
npm start 2>&1 | tee logs.txt
```

## Docker

```bash
# Build image
docker build -t mern-backend .

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/mern-auth \
  -e JWT_SECRET=your_secret \
  mern-backend
```

## Error Handling

API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request / Validation error
- `401` - Unauthorized / Invalid token
- `404` - Not found
- `500` - Server error

## Extending the API

### Add New Route

Create file: `routes/users.js`
```javascript
const express = require('express');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.put('/profile', authMiddleware, async (req, res) => {
  // Update user profile logic
});

module.exports = router;
```

Import in `server.js`:
```javascript
app.use('/api/users', require('./routes/users'));
```

### Add New Middleware

Create file: `middleware/logging.js`
```javascript
const loggingMiddleware = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = loggingMiddleware;
```

Use in `server.js`:
```javascript
app.use(require('./middleware/logging'));
```

## Testing

Example cURL requests:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get profile (use token from login/register response)
curl -X GET http://localhost:5000/api/protected/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Performance Tips

- Enable MongoDB connection pooling
- Cache frequently accessed data
- Implement rate limiting for auth endpoints
- Use compression (gzip)
- Monitor logs for errors

## Support

For issues or questions, see main README.md

