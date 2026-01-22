# Malaysia Public Holiday Checker

A simple web application for viewing public holidays in Malaysia and other countries.

## Live Demo

[https://calendar-holidays.onrender.com](https://calendar-holidays.onrender.com)

## Features

- Calendar and table views for holidays
- Multiple country support (Malaysia, Singapore, Indonesia, Thailand, US, UK)
- State-specific holiday information
- Responsive design

## Structure

```
holidays/
├── frontend/          # React + Vite app
└── backend/           # Express API server
```

## Quick Start

### Prerequisites

- Node.js 16+
- Calendarific API key ([Get free key](https://calendarific.com/api-documentation))

### Installation

1. **Install dependencies**
```bash
npm run install:all
```

2. **Configure backend**
```bash
cd backend
cp .env.example .env
# Edit .env and add your API key
```

3. **Configure frontend** (for development)
```bash
cd frontend
cp .env.example .env
# Edit .env if needed (defaults to localhost:5174)
```

4. **Start development**
```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5174

## API Endpoints

### Health Check
```
GET http://localhost:5174/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T00:00:00.000Z"
}
```

### Get Holidays
```
GET http://localhost:5174/api/holidays?country=MY&year=2026
```

## Available Scripts

```bash
npm run install:all     # Install all dependencies
npm run dev             # Start both frontend and backend (development)
npm run build           # Build frontend and install all deps
npm start               # Start production server (serves both)
```

## Frontend

- React 18 + Vite
- FontAwesome icons
- Axios for API calls

**Environment variables** (optional):
```bash
# Development - use localhost
VITE_API_URL=http://localhost:5174

# Production - leave empty to use relative paths
VITE_API_URL=
```

## Backend

- Express server
- CORS enabled
- Proxies Calendarific API
- Serves frontend static files

**Environment variables** (required):
```bash
CALENDARIFIC_API_KEY=your_api_key_here
PORT=5174
```

## Deploy to Render (Single Web Service)

### Step 1: Prepare Your Repository

1. **Commit all changes**
```bash
git add .
git commit -m "feat: setup for Render deployment"
git push origin main
```

### Step 2: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository

### Step 3: Configure Service

**Basic Settings:**
- **Name:** `calendar-holidays` (or your choice)
- **Root Directory:** (leave empty)
- **Environment:** `Node`
- **Region:** Choose closest to your location
- **Branch:** `main`

**Build & Deploy:**
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

**Instance Type:**
- Select **Free** (or paid plan for always-on service)

### Step 4: Environment Variables

Click **"Environment"** tab and add:

```
CALENDARIFIC_API_KEY=your_actual_api_key_here
NODE_ENV=production
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies
   - Build the frontend
   - Start the backend server
   - Serve everything from one URL

3. Your app will be live at: `https://your-app-name.onrender.com`

### Step 6: Test Deployment

Once deployed, test these endpoints:

- **Frontend:** `https://your-app-name.onrender.com/`
- **Health Check:** `https://your-app-name.onrender.com/health`
- **API:** `https://your-app-name.onrender.com/api/holidays?country=MY&year=2026`

## Important Notes

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-50 seconds
- Upgrade to paid plan ($7/month) for always-on service

### Troubleshooting

**Build fails:**
- Check build logs in Render dashboard
- Ensure `CALENDARIFIC_API_KEY` is set in environment variables
- Verify your repository has latest changes

**App loads but no holidays:**
- Check environment variables are set correctly
- Test health endpoint: `/health`
- Test API endpoint: `/api/holidays?country=MY&year=2026`

**404 errors:**
- Ensure backend server is serving static files
- Check `server.js` has the `app.get('*')` catch-all route

### Custom Domain

To use a custom domain:
1. Go to your web service settings
2. Click **"Custom Domain"**
3. Add your domain and follow DNS configuration instructions

## Local Production Testing

Test the production setup locally before deploying:

```bash
# Build frontend
npm run build

# Start production server
npm start

# Visit http://localhost:5174
```

The server will serve both API and frontend from one port.

## License

MIT
