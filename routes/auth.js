import express from 'express';
import { register, login, getProfile, deleteAccount } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, getProfile);

// @route   DELETE /api/auth/account
// @desc    Delete user account and all data
// @access  Private
router.delete('/account', auth, deleteAccount);

export default router;