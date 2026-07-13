const mongoose = require('mongoose');

let isMockMode = false;

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unismart';
    try {
        console.log(`Connecting to MongoDB at ${mongoURI}...`);
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 2000 // 2 seconds timeout for quick fallback
        });
        console.log('MongoDB Connected successfully!');
    } catch (err) {
        console.warn('========================================================');
        console.warn('WARNING: Failed to connect to MongoDB!');
        console.warn('Error details:', err.message);
        console.warn('UniSmart server is starting in MOCK DATABASE mode.');
        console.warn('All data changes will be written in-memory for testing.');
        console.warn('========================================================');
        isMockMode = true;
    }
};

const getDbMode = () => isMockMode;

module.exports = { connectDB, getDbMode };
