const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');

// register a new user 
router.post('/register', async (req, res) => {
    try {
        const {
            emailAddress,
            password,
            verifyPassword
        } = req.body;

        if (!emailAddress || !password || !verifyPassword) {
            return res.status(400).json({
                error: 'Please provide email, password and verify password'
            });
        }

        if (password !== verifyPassword) {
            return res.status(400).json({
                error: 'Passwords do not match'
            });
        }

        const userExists = await User.findOne({ emailAddress });
        if (userExists) {
            return res.status(400).json({
                error: 'Email already registered'
            });
        }

        const user = await User.create({
            emailAddress,
            password
        });

        generateToken(res, user._id);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                emailAddress: user.emailAddress,
                gamesWon: user.gamesWon,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Server error during registration'
        });
    }
});

// login existing user
router.post('/login', async (req, res) => {
    try {
        const {
            emailAddress,
            password
        } = req.body;

        if (!emailAddress || !password) {
            return res.status(400).json({
                error: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ emailAddress });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        generateToken(res, user._id);

        res.status(200).json({
            message: 'User logged in successfully',
            user: {
                id: user._id,
                emailAddress: user.emailAddress,
                gamesWon: user.gamesWon,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Server error during login'
        });
    }
});

// logout user (clear cookie )
router.post('/logout', (req, res) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0)
        });

        res.status(200).json({
            message: 'User logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Server error during logout'
        });
    }
});

// check if user is logged in 
router.get('/isLoggedIn', protect, (req, res) => {
    try {
        res.status(200).json({
            isLoggedIn: true,
            user: {
                id: req.user._id,
                emailAddress: req.user.emailAddress,
                gamesWon: req.user.gamesWon,
            },
        });
    } catch (error) {
        console.error('isLoggedIn error:', error);
        res.status(500).json({
            error: 'Server error during isLoggedIn check'
        })
    }
});

module.exports = router;