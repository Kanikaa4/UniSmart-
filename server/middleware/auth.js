const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'unismart_jwt_secret_key';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Token missing.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Access denied. Invalid session token.' });
    }
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: `Requires ${role} administrative permissions.` });
        }
        next();
    };
};

module.exports = { verifyToken, requireRole };
