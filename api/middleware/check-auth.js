const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, "secretkey");

        req.userData = decoded;
        next();
    } catch (error) {
        console.error("JWT Error:", error); // Log the error for debugging
        let message = 'Authentication failed';
        if (error.name === 'TokenExpiredError') {
            message = 'Token has expired';
        } else if (error.name === 'JsonWebTokenError') {

            message = 'Invalid token';

        }
        return res.status(401).json({ message });
    }
};