# Quick Start Guide - HabitFlow

## Running Locally (Development)

### 1. Start the Backend
```bash
# Install dependencies (first time only)
npm install --prefix backend

# Start the server
npm start --prefix backend
```

The backend will run on `http://localhost:5000`

### 2. Start the Frontend
Open `index.html` in your browser using a live server:

**Option A: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

**Option B: Python HTTP Server**
```bash
python -m http.server 5500
```
Then open `http://localhost:5500`

### 3. Test the API
Open `test.html` in your browser to run the API test suite.

---

## First Time Setup

1. **Install MongoDB** (if running locally) or create a MongoDB Atlas account
2. **Update `.env` file** in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/habitflow
   JWT_SECRET=your_super_secret_key_here
   CLIENT_ORIGIN=http://127.0.0.1:5500
   ```

3. **Install dependencies**:
   ```bash
   npm install --prefix backend
   ```

---

## Testing the Application

1. **Open the frontend** at `http://localhost:5500` (or your live server URL)
2. **Sign up** with a test account
3. **Create a habit** (e.g., "Morning Exercise")
4. **Click on today's date** in the calendar to mark it complete
5. **Check Analytics** page to see your XP and streak
6. **Add a task** in the Tasks page
7. **View your profile** to see badges

---

## Project Structure

```
habittracker/
├── backend/               # Node.js/Express backend
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth & error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic (analytics)
│   ├── server.js         # Entry point
│   └── package.json
├── css/                  # Stylesheets
│   ├── styles.css        # Base styles
│   └── components.css    # UI components
├── js/                   # Frontend JavaScript
│   ├── api.js           # API handler
│   ├── auth.js          # Authentication
│   ├── calendar.js      # Calendar utility
│   ├── habits.js        # Habit management
│   ├── tasks.js         # Task management
│   ├── analytics.js     # Analytics page
│   ├── profile.js       # Profile page
│   └── ui.js            # Shared UI logic
├── index.html           # Login/Signup page
├── habits.html          # Main habit tracker
├── analytics.html       # Progress dashboard
├── tasks.html           # To-do list
├── profile.html         # User profile
├── test.html            # API test suite
└── README.md
```

---

## Common Issues

### Backend won't start
- **Error: MongoDB connection failed**
  - Check if MongoDB is running locally
  - Verify `MONGO_URI` in `.env` is correct

### Frontend can't connect
- **CORS errors**
  - Make sure `CLIENT_ORIGIN` in backend `.env` matches your frontend URL
  - Default is `http://127.0.0.1:5500`

### 401 Unauthorized
- Clear browser localStorage and log in again
- Check that you're logged in (token exists)

---

## Next Steps

1. ✅ Test locally
2. 📦 Deploy backend to Render
3. 🌐 Deploy frontend to GitHub Pages
4. 🔒 Update production environment variables

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.
