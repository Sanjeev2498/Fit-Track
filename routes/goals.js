import express from 'express';
import {
  getGoals,
  updateGoals,
  getGoalProgress,
  getGoalRecommendations
} from '../controllers/goalController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/goals/recommendations
// @desc    Get goal recommendations based on user profile
// @access  Private
router.get('/recommendations', getGoalRecommendations);

// @route   GET /api/goals/progress
// @desc    Get goal progress
// @access  Private
router.get('/progress', getGoalProgress);

// @route   GET /api/goals
// @desc    Get user goals
// @access  Private
router.get('/', getGoals);

// @route   PUT /api/goals
// @desc    Update user goals
// @access  Private
router.put('/', updateGoals);

export default router;