import Workout from '../models/Workout.js';

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
  try {
    const workoutData = {
      ...req.body,
      user: req.user._id
    };

    const workout = new Workout(workoutData);
    await workout.save();

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: {
        workout
      }
    });
  } catch (error) {
    console.error('Create workout error:', error.message);
    
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
      message: 'Server error creating workout'
    });
  }
};

// @desc    Get all workouts for user
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res) => {
  try {
    const { page = 1, limit = 10, workoutType, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = { user: req.user._id };
    
    if (workoutType) {
      filter.workoutType = workoutType;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const workouts = await Workout.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await Workout.countDocuments(filter);

    res.json({
      success: true,
      data: {
        workouts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalWorkouts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching workouts'
    });
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'name email');

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.json({
      success: true,
      data: {
        workout
      }
    });
  } catch (error) {
    console.error('Get workout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching workout'
    });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Update workout fields
    Object.keys(req.body).forEach(key => {
      workout[key] = req.body[key];
    });

    await workout.save();

    res.json({
      success: true,
      message: 'Workout updated successfully',
      data: {
        workout
      }
    });
  } catch (error) {
    console.error('Update workout error:', error.message);
    
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
      message: 'Server error updating workout'
    });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    await Workout.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting workout'
    });
  }
};

// @desc    Get workout statistics
// @route   GET /api/workouts/stats
// @access  Private
const getWorkoutStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = { user: req.user._id };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const stats = await Workout.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$totalCaloriesBurned' },
          avgDuration: { $avg: '$duration' },
          avgCalories: { $avg: '$totalCaloriesBurned' }
        }
      }
    ]);

    const workoutsByType = await Workout.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$workoutType',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$totalCaloriesBurned' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalWorkouts: 0,
          totalDuration: 0,
          totalCalories: 0,
          avgDuration: 0,
          avgCalories: 0
        },
        byType: workoutsByType
      }
    });
  } catch (error) {
    console.error('Get workout stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching workout statistics'
    });
  }
};

export {
  createWorkout,
  getWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats
};