import express from 'express';
import {
  createMeal,
  getMeals,
  getMeal,
  updateMeal,
  deleteMeal,
  getDailyNutrition,
  getNutritionStats
} from '../controllers/mealController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/meals/stats
// @desc    Get nutrition statistics
// @access  Private
router.get('/stats', getNutritionStats);

// @route   GET /api/meals/daily/:date
// @desc    Get daily nutrition summary
// @access  Private
router.get('/daily/:date', getDailyNutrition);

// @route   POST /api/meals
// @desc    Create new meal
// @access  Private
router.post('/', createMeal);

// @route   GET /api/meals
// @desc    Get all meals for user
// @access  Private
router.get('/', getMeals);

// @route   GET /api/meals/:id
// @desc    Get single meal
// @access  Private
router.get('/:id', getMeal);

// @route   PUT /api/meals/:id
// @desc    Update meal
// @access  Private
router.put('/:id', updateMeal);

// @route   DELETE /api/meals/:id
// @desc    Delete meal
// @access  Private
router.delete('/:id', deleteMeal);

export default router;