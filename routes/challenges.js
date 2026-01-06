import express from 'express';
import {
  createChallenge,
  getChallenges,
  getChallenge,
  joinChallenge,
  leaveChallenge,
  updateProgress,
  getUserChallenges,
  getLeaderboard
} from '../controllers/challengeController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/challenges/my-challenges
// @desc    Get user's challenges
// @access  Private
router.get('/my-challenges', getUserChallenges);

// @route   POST /api/challenges
// @desc    Create new challenge
// @access  Private
router.post('/', createChallenge);

// @route   GET /api/challenges
// @desc    Get all public challenges
// @access  Private
router.get('/', getChallenges);

// @route   GET /api/challenges/:id
// @desc    Get single challenge
// @access  Private
router.get('/:id', getChallenge);

// @route   POST /api/challenges/:id/join
// @desc    Join a challenge
// @access  Private
router.post('/:id/join', joinChallenge);

// @route   POST /api/challenges/:id/leave
// @desc    Leave a challenge
// @access  Private
router.post('/:id/leave', leaveChallenge);

// @route   PUT /api/challenges/:id/progress
// @desc    Update challenge progress
// @access  Private
router.put('/:id/progress', updateProgress);

// @route   GET /api/challenges/:id/leaderboard
// @desc    Get challenge leaderboard
// @access  Private
router.get('/:id/leaderboard', getLeaderboard);

export default router;