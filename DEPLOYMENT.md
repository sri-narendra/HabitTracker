# Render Deployment Guide

## Environment Variables Required

Set these in your Render dashboard (Environment tab):

1. **MONGO_URI**
   - Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/habittracker?retryWrites=true&w=majority`

2. **JWT_SECRET**
   - A secure random string for JWT token signing
   - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

3. **CLIENT_ORIGIN**
   - Set to: `https://habittracker-sqyy.onrender.com`

4. **PORT** (Optional)
   - Render sets this automatically, but you can override if needed
   - Default: 10000

## Build Settings

In your Render dashboard, configure:

- **Build Command**: `cd backend && npm install`
- **Start Command**: `npm start`
- **Root Directory**: Leave blank (uses repository root)

## After Deployment

1. Wait for the build to complete
2. Check the logs for any errors
3. Visit `https://habittracker-sqyy.onrender.com` to test
4. The login page should load
5. Test signup/login functionality

## Troubleshooting

If you still see 404 errors:
1. Check Render logs for startup errors
2. Verify all environment variables are set
3. Ensure MongoDB connection string is correct
4. Check that the build completed successfully
