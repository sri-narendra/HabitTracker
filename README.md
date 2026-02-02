# HabitFlow - Full-Stack Habit Tracker

A modern, production-quality habit tracking application built with Vanilla HTML/CSS/JS and a Node.js/Express backend.

## Features
- **Dark-Mode First UI**: Sleek, modern design using glassmorphism and rounded components.
- **Monthly Habit Grid**: Track consistency across a full month for multiple habits.
- **Gamified Progress**: Earn XP, level up, and maintain streaks (managed by backend analytics).
- **Interactive Analytics**: SVG-based consistency charts and streak heatmaps.
- **Temporary Tasks**: Simple non-gamified to-do list for quick tasks.
- **JWT Authentication**: Secure login/signup with token-based session management.
- **Real-time Persistence**: MongoDB integration for all user data.

## Project Structure
- `/` - Frontend files (HTML, CSS, JS)
- `/backend` - Node.js Express server
- `/backend/models` - Mongoose schemas (User, Habit, Completion, etc.)
- `/backend/services` - Analytics engine for streaks and XP

## Setup & Deployment

### Backend (Deployed on Render)
1. Navigate to the `backend` directory.
2. Create a `.env` file based on the environment variables required:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure string for signing tokens.
   - `CLIENT_ORIGIN`: The URL of your GitHub Pages frontend.
3. On Render:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Frontend (Deployed on GitHub Pages)
1. Push all files in the root directory (excluding `/backend`) to your GitHub repository.
2. Update `js/api.js` with your Render backend URL:
   ```javascript
   const API_BASE_URL = 'https://your-backend-on-render.com/api';
   ```
3. Enable GitHub Pages in your repository settings.

## Development
- Run backend locally: `npm install --prefix backend && npm run dev --prefix backend`
- Serve frontend: Use any live server (e.g., Live Server extension in VS Code).
