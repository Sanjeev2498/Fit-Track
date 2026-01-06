import Meal from '../models/Meal.js';

// @desc    Create new meal
// @route   POST /api/meals
// @access  Private
const createMeal = async (req, res) => {
  try {
    const mealData = {
      ...req.body,
      user: req.user._id
    };

    const meal = new Meal(mealData);
    await meal.save();

    res.status(201).json({
      success: true,
      message: 'Meal logged successfully',
      data: {
        meal
      }
    });
  } catch (error) {
    console.error('Create meal error:', error.message);
    
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
      message: 'Server error creating meal'
    });
  }
};

// @desc    Get all meals for user
// @route   GET /api/meals
// @access  Private
const getMeals = async (req, res) => {
  try {
    const { page = 1, limit = 10, mealType, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = { user: req.user._id };
    
    if (mealType) {
      filter.mealType = mealType;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const meals = await Meal.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await Meal.countDocuments(filter);

    res.json({
      success: true,
      data: {
        meals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalMeals: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get meals error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching meals'
    });
  }
};

// @desc    Get single meal
// @route   GET /api/meals/:id
// @access  Private
const getMeal = async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'name email');

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    res.json({
      success: true,
      data: {
        meal
      }
    });
  } catch (error) {
    console.error('Get meal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching meal'
    });
  }
};

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Update meal fields
    Object.keys(req.body).forEach(key => {
      meal[key] = req.body[key];
    });

    await meal.save();

    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: {
        meal
      }
    });
  } catch (error) {
    console.error('Update meal error:', error.message);
    
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
      message: 'Server error updating meal'
    });
  }
};

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    await Meal.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting meal'
    });
  }
};

// @desc    Get daily nutrition summary
// @route   GET /api/meals/daily/:date
// @access  Private
const getDailyNutrition = async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    
    // Get start and end of the day
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const meals = await Meal.find({
      user: req.user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ date: 1 });

    // Calculate daily totals
    const dailyTotals = meals.reduce((totals, meal) => {
      totals.calories += meal.totalCalories;
      totals.protein += meal.totalMacros.protein;
      totals.carbs += meal.totalMacros.carbs;
      totals.fat += meal.totalMacros.fat;
      totals.fiber += meal.totalMacros.fiber;
      totals.sugar += meal.totalMacros.sugar;
      totals.water += meal.waterIntake;
      return totals;
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      water: 0
    });

    // Group meals by type
    const mealsByType = {
      breakfast: meals.filter(meal => meal.mealType === 'breakfast'),
      lunch: meals.filter(meal => meal.mealType === 'lunch'),
      dinner: meals.filter(meal => meal.mealType === 'dinner'),
      snack: meals.filter(meal => meal.mealType === 'snack')
    };

    res.json({
      success: true,
      data: {
        date: date,
        dailyTotals,
        mealsByType,
        totalMeals: meals.length
      }
    });
  } catch (error) {
    console.error('Get daily nutrition error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching daily nutrition'
    });
  }
};

// @desc    Get nutrition statistics
// @route   GET /api/meals/stats
// @access  Private
const getNutritionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = { user: req.user._id };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const stats = await Meal.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalMeals: { $sum: 1 },
          avgCalories: { $avg: '$totalCalories' },
          totalCalories: { $sum: '$totalCalories' },
          avgProtein: { $avg: '$totalMacros.protein' },
          avgCarbs: { $avg: '$totalMacros.carbs' },
          avgFat: { $avg: '$totalMacros.fat' },
          totalWater: { $sum: '$waterIntake' }
        }
      }
    ]);

    const mealsByType = await Meal.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$mealType',
          count: { $sum: 1 },
          avgCalories: { $avg: '$totalCalories' },
          totalCalories: { $sum: '$totalCalories' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalMeals: 0,
          avgCalories: 0,
          totalCalories: 0,
          avgProtein: 0,
          avgCarbs: 0,
          avgFat: 0,
          totalWater: 0
        },
        byMealType: mealsByType
      }
    });
  } catch (error) {
    console.error('Get nutrition stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching nutrition statistics'
    });
  }
};

export {
  createMeal,
  getMeals,
  getMeal,
  updateMeal,
  deleteMeal,
  getDailyNutrition,
  getNutritionStats
};