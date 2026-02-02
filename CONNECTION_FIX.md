# Server Connection Issue - SOLVED

## Problem
When opening HTML files directly (using `file://` protocol), browsers block fetch requests to `localhost` for security reasons.

## Solution
You MUST serve the frontend files using a web server, not open them directly.

### Option 1: Use Live Server (RECOMMENDED)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. It will open at `http://localhost:5500` or similar

### Option 2: Use Python HTTP Server
```bash
# In the project root directory
python -m http.server 5500
```
Then open: `http://localhost:5500`

### Option 3: Use Node.js http-server
```bash
# Install globally (one time)
npm install -g http-server

# Run in project root
http-server -p 5500
```
Then open: `http://localhost:5500`

## Why This Happens
- Opening `file:///C:/path/to/index.html` uses the `file://` protocol
- Browsers block `file://` pages from making fetch requests to `http://localhost` for security
- This is called **CORS policy** and **mixed content blocking**

## Verification
Once you serve the files properly:
1. Backend: `http://localhost:3000` ✅ (already running)
2. Frontend: `http://localhost:5500` ✅ (needs to be served)

Both must use `http://` protocol for fetch to work!

## Current Status
- ✅ Backend is running correctly on port 3000
- ✅ MongoDB connected
- ✅ CORS configured properly
- ❌ Frontend needs to be served via HTTP server (not file://)
