require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/error');

const app = express();

// Trust proxy for Render deployment (required for rate limiting behind load balancer)
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Request logging middleware (BEFORE routes)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
    console.log(`  Origin: ${req.headers.origin}`);
    console.log(`  Headers: ${JSON.stringify(req.headers)}`);
    next();
});

// Handle OPTIONS requests explicitly for CORS preflight (BEFORE rate limiting!)
app.options('*', (req, res) => {
    console.log('OPTIONS request received for:', req.url);
    res.header('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

// Rate Limiting (only on auth routes to avoid blocking other requests)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Serve static files from parent directory (frontend files)
app.use(express.static(path.join(__dirname, '..')));

// Basic Route
app.get('/api/status', (req, res) => {
    console.log('Status endpoint hit!');
    res.json({ status: "ok" });
});

// API Routes
app.use('/api/auth', limiter, require('./routes/authRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Database Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        // Do not exit process, let Render restart it or just log the error
    }
};

mongoose.connection.on('error', err => {
    console.error('MongoDB Runtime Error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB Disconnected');
});

connectDB();

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`CORS enabled for: ${process.env.CLIENT_ORIGIN}`);
});
