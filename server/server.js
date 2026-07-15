require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDbMode } = require('./config/db');
const { seedDatabase } = require('./config/seed');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
    origin: '*', // In development, allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', mode: require('./config/db').getDbMode() ? 'MOCK' : 'DATABASE' });
});

// Default Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const startServer = async () => {
    await connectDB();
    if (!getDbMode()) {
        await seedDatabase();
    }
    app.listen(PORT, () => {
        console.log(`UniSmart Server is actively running on http://localhost:${PORT}`);
    });
};

startServer();
