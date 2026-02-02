# Deployment Guide - HabitFlow

## Prerequisites
- MongoDB Atlas account (or local MongoDB instance)
- GitHub account
- Render account

---

## Step 1: MongoDB Setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with read/write permissions
3. Whitelist all IP addresses (0.0.0.0/0) for development, or specific IPs for production
4. Copy your connection string (should look like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/habitflow?retryWrites=true&w=majority
   ```

---

## Step 2: Backend Deployment (Render)

1. **Push backend to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create a new Web Service on Render**:
   - Connect your GitHub repository
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Add Environment Variables** in Render dashboard:
   ```
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<generate-a-secure-random-string>
   CLIENT_ORIGIN=https://<your-username>.github.io/<repo-name>
   PORT=5000
   ```

4. **Deploy** and note your backend URL (e.g., `https://habitflow-backend.onrender.com`)

---

## Step 3: Frontend Configuration

1. **Update API Base URL** in `js/api.js`:
   ```javascript
   const API_BASE_URL = 'https://habitflow-backend.onrender.com/api';
   ```

2. **Commit the change**:
   ```bash
   git add js/api.js
   git commit -m "Update API URL for production"
   git push
   ```

---

## Step 4: Frontend Deployment (GitHub Pages)

1. Go to your repository **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main` / `root`
4. **Save**

Your app will be live at: `https://<your-username>.github.io/<repo-name>`

---

## Step 5: Update CORS in Backend

Once you have your GitHub Pages URL, update the `CLIENT_ORIGIN` environment variable in Render to match it exactly.

---

## Local Development

### Backend
```bash
cd backend
npm install
# Create .env file with local MongoDB URI
npm run dev
```

### Frontend
Use Live Server or any static file server:
```bash
# Using Python
python -m http.server 5500

# Or use VS Code Live Server extension
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/habitflow` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key_min_32_chars` |
| `CLIENT_ORIGIN` | Frontend URL (for CORS) | `https://yourusername.github.io/habitflow` |
| `PORT` | Server port (Render sets this automatically) | `5000` |

---

## Troubleshooting

### Backend won't start
- Check MongoDB connection string is correct
- Ensure all environment variables are set in Render
- Check Render logs for specific errors

### Frontend can't connect to backend
- Verify `API_BASE_URL` in `js/api.js` matches your Render URL
- Check CORS settings: `CLIENT_ORIGIN` must match your GitHub Pages URL exactly
- Open browser console to see specific error messages

### 401 Unauthorized errors
- Clear browser localStorage and try logging in again
- Check that JWT_SECRET is set in backend environment variables

---

## Production Checklist

- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] Backend deployed to Render with all environment variables
- [ ] Frontend `js/api.js` updated with production backend URL
- [ ] GitHub Pages enabled and site is accessible
- [ ] CORS `CLIENT_ORIGIN` matches GitHub Pages URL
- [ ] Test signup/login flow
- [ ] Test habit creation and completion
- [ ] Verify analytics calculations
- [ ] Test on mobile devices
