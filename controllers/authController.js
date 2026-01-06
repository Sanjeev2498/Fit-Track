import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, age, gender, height, weight, activityLevel, fitnessGoal } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      age,
      gender,
      height,
      weight,
      activityLevel,
      fitnessGoal
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from user object
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// @desc    Delete user account and all associated data
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Import models dynamically to avoid circular dependencies
    const User = (await import('../models/User.js')).default;
    const Workout = (await import('../models/Workout.js')).default;
    const Meal = (await import('../models/Meal.js')).default;
    const Challenge = (await import('../models/Challenge.js')).default;

    console.log(`Starting account deletion for user: ${userId}`);

    // Delete all user's workouts
    const workoutDeleteResult = await Workout.deleteMany({ user: userId });
    console.log(`Deleted ${workoutDeleteResult.deletedCount} workouts`);

    // Delete all user's meals
    const mealDeleteResult = await Meal.deleteMany({ user: userId });
    console.log(`Deleted ${mealDeleteResult.deletedCount} meals`);

    // Remove user from all challenges they participated in
    const challengeUpdateResult = await Challenge.updateMany(
      { 'participants.user': userId },
      { $pull: { participants: { user: userId } } }
    );
    console.log(`Removed user from ${challengeUpdateResult.modifiedCount} challenges`);

    // Delete challenges created by the user (only if they have no other participants)
    const userChallenges = await Challenge.find({ creator: userId });
    let deletedChallenges = 0;
    
    for (const challenge of userChallenges) {
      // If challenge has only the creator as participant, delete it
      if (challenge.participants.length <= 1) {
        await Challenge.findByIdAndDelete(challenge._id);
        deletedChallenges++;
      } else {
        // If challenge has other participants, just remove the creator and assign to first participant
        const newCreator = challenge.participants.find(p => p.user.toString() !== userId.toString());
        if (newCreator) {
          challenge.creator = newCreator.user;
          await challenge.save();
        }
      }
    }
    console.log(`Deleted ${deletedChallenges} empty challenges`);

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);
    console.log('User account deleted successfully');

    res.json({
      success: true,
      message: 'Account and all associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting account'
    });
  }
};

export {
  register,
  login,
  getProfile,
  deleteAccount
};