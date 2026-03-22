# Frontend - MERN Authentication UI

React + Vite + React Router frontend with JWT authentication.

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# App runs on http://localhost:3000
```

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx        # Login form page
│   │   ├── Register.jsx     # Registration form page
│   │   └── Dashboard.jsx    # Protected dashboard
│   ├── services/
│   │   └── authService.js   # API calls with axios
│   ├── styles/
│   │   ├── Auth.css         # Login/Register styles
│   │   ├── Dashboard.css    # Dashboard styles
│   │   └── index.css        # Global styles
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # React entry point
│   └── index.css            # Base styles
├── .env.example
├── Dockerfile
├── vite.config.js
├── index.html
└── package.json
```

## Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# For Docker, use:
# VITE_API_URL=http://backend:5000/api
```

## Pages

### Login (`/login`)
- Email and password form
- "Don't have an account?" link to register
- Redirects to dashboard on successful login

### Register (`/register`)
- Username, email, password form
- Password confirmation field
- "Already have an account?" link to login
- Validates password match before submission

### Dashboard (`/dashboard`)
- Protected route (requires valid JWT token)
- Displays user profile information
- Shows username, email, member since date
- Logout button

## Features

- 🔐 JWT Authentication with token storage
- 🔑 Automatic token attachment to API requests
- 🛡️ Protected routes requiring authentication
- 🔄 Automatic redirect on token expiration
- 📱 Responsive mobile-friendly design
- ⚡ Fast development with Vite
- 🎨 Clean, modern UI with gradients
- ✅ Input validation

## API Integration

### authService.js

Axios instance with automatic token handling:

```javascript
// Register new user
authService.register(username, email, password)

// Login user
authService.login(email, password)

// Get current user profile
authService.getProfile()
```

### Token Management

- Token stored in localStorage
- Automatically added to all API requests via interceptor
- Automatically redirects to login if token expires (401 response)

## Routing

```
/             → Dashboard (if authenticated) or Login
/login        → Login page (redirect to dashboard if authenticated)
/register     → Register page (redirect to dashboard if authenticated)
/dashboard    → User dashboard (protected route)
```

## Development

```bash
# Install dependencies
npm install

# Start Vite dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Styling

The app uses vanilla CSS with:
- Gradient backgrounds (#667eea to #764ba2)
- Responsive flexbox layouts
- Smooth transitions and hover effects
- Mobile-first design

Key files:
- `Auth.css` - Login/Register pages
- `Dashboard.css` - Dashboard page
- `index.css` - Global styles

## Dependencies

- **react** - UI library
- **react-dom** - React rendering
- **react-router-dom** - Client-side routing
- **axios** - HTTP client

## Docker

```bash
# Build image
docker build -t mern-frontend .

# Run container
docker run -p 3000:3000 \
  -e VITE_API_URL=http://localhost:5000/api \
  mern-frontend
```

## Testing

Manual testing flow:

1. **Register test:**
   - Go to http://localhost:3000/register
   - Fill in username, email, password
   - Submit form
   - Should redirect to dashboard

2. **Login test:**
   - Go to http://localhost:3000/login
   - Fill in email and password
   - Submit form
   - Should show user profile

3. **Session persistence:**
   - Refresh page
   - Should stay logged in (token in localStorage)
   - Can access dashboard

4. **Token expiration:**
   - Wait for token to expire (default 7 days)
   - Or manually delete token from localStorage
   - Try to access protected route
   - Should redirect to login

## API Error Handling

The app handles various error scenarios:

```javascript
// 400 - Validation error
{
  "errors": [
    { "msg": "Validation error message" }
  ]
}

// 401 - Unauthorized
{
  "error": "Invalid credentials"
}

// 500 - Server error
{
  "error": "Server error during login"
}
```

## Performance Tips

- Uses Vite for fast hot module replacement
- Code splitting for production builds
- CSS included inline where appropriate
- Images optimized by Vite

## Customization

### Change Colors

Edit `src/styles/Auth.css` and `src/styles/Dashboard.css`:

```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change button color */
background-color: #YOUR_COLOR;
```

### Add New Pages

1. Create `src/pages/NewPage.jsx`:
```javascript
function NewPage() {
  return <div>New Page</div>;
}
export default NewPage;
```

2. Import in `App.jsx`:
```javascript
import NewPage from './pages/NewPage';

// In Routes:
<Route path="/newpage" element={<NewPage />} />
```

### Add API Endpoints

Update `src/services/authService.js`:
```javascript
export const authService = {
  // ... existing endpoints
  getUsers: () => api.get('/users'),
  updateProfile: (userData) => api.put('/users/profile', userData),
};
```

## Common Issues

### API requests fail with CORS error
- Check backend is running on correct port
- Verify VITE_API_URL is correct in .env
- Check backend CORS settings

### Token not persisting after refresh
- Check browser localStorage is enabled
- Verify token is saved in localStorage (DevTools → Application → Local Storage)

### Redirects to login unexpectedly
- Token may have expired
- Check JWT_EXPIRE setting in backend
- Verify JWT_SECRET matches between frontend and backend

## Production Deployment

```bash
# Build production assets
npm run build

# Output in dist/ directory
# Serve with: npx serve -s dist -l 3000
```

## Next Steps

- Add email verification
- Add password reset
- Add user profile editing
- Add 2FA authentication
- Add OAuth providers (Google, GitHub)
- Add dark mode theme

## Support

For issues or questions, see main README.md

