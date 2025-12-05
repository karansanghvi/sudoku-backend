const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ 
                error: 'Not authorized, no token provided' 
            });
        }

        const user = await User.findById(token).select('-password');

        if (!user) {
            return res.status(401).json({ 
                error: 'Not authorized, user not found' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ 
            error: 'Not authorized, token failed' 
        });
    }
};

module.exports = { protect };