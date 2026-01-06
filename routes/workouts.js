import express from 'express';
import {
  createWorkout,
  getWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats
} from '../controllers/workoutController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/workouts/stats
// @desc    Get workout statistics
// @access  Private
router.get('/stats', getWorkoutStats);

// @route   POST /api/workouts
// @desc    Create new workout
// @access  Private
router.post('/', createWorkout);

// @route   GET /api/workouts
// @desc    Get all workouts for user
// @access  Private
router.get('/', getWorkouts);

// @route   GET /api/workouts/:id
// @desc    Get single workout
// @access  Private
router.get('/:id', getWorkout);

// @route   PUT /api/workouts/:id
// @desc    Update workout
// @access  Private
router.put('/:id', updateWorkout);

// @route   DELETE /api/workouts/:id
// @desc    Delete workout
// @access  Private
router.delete('/:id', deleteWorkout);

export default router;