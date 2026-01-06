import User from '../models/User.js';
import Meal from '../models/Meal.js';
import Workout from '../models/Workout.js';

// @desc    Get user goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('goals fitnessGoal');

    res.json({
      success: true,
      data: {
        goals: user.goals,
        fitnessGoal: user.fitnessGoal
      }
    });
  } catch (error) {
    console.error('Get goals error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching goals'
    });
  }
};

// @desc    Update user goals
// @route   PUT /api/goals
// @access  Private
const updateGoals = async (req, res) => {
  try {
    console.log('Received goals update request:', req.body); // Debug log
    
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Current user goals:', user.goals); // Debug log

    // Initialize goals if they don't exist
    if (!user.goals) {
      user.goals = {};
    }

    // Update goals
    if (req.body.goals) {
      user.goals = { ...user.goals, ...req.body.goals };
      console.log('Updated goals:', user.goals); // Debug log
    }

    // Update fitness goal if provided
    if (req.body.fitnessGoal) {
      user.fitnessGoal = req.body.fitnessGoal;
    }

    await user.save();
    console.log('Goals saved successfully'); // Debug log

    res.json({
      success: true,
      message: 'Goals updated successfully',
      data: {
        goals: user.goals,
        fitnessGoal: user.fitnessGoal
      }
    });
  } catch (error) {
    console.error('Update goals error:', error.message);
    console.error('Full error:', error); // More detailed error log
    
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
      message: 'Server error updating goals'
    });
  }
};

// @desc    Get goal progress
// @route   GET /api/goals/progress
// @access  Private
const getGoalProgress = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const user = await User.findById(req.user._id);

    if (!user || !user.goals) {
      return res.status(404).json({
        success: false,
        message: 'No goals found for user'
      });
    }

    // Set date range (default to current week)
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get meals for the period
    const meals = await Meal.find({
      user: req.user._id,
      date: { $gte: start, $lte: end }
    });

    // Get workouts for the period
    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: start, $lte: end }
    });

    // Calculate nutrition progress
    const nutritionProgress = meals.reduce((totals, meal) => {
      totals.calories += meal.totalCalories;
      totals.protein += meal.totalMacros.protein;
      totals.carbs += meal.totalMacros.carbs;
      totals.fat += meal.totalMacros.fat;
      totals.water += meal.waterIntake;
      return totals;
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      water: 0
    });

    // Calculate workout progress
    const workoutProgress = {
      totalWorkouts: workouts.length,
      totalDuration: workouts.reduce((total, workout) => total + (workout.duration || 0), 0),
      totalCaloriesBurned: workouts.reduce((total, workout) => total + (workout.totalCaloriesBurned || 0), 0)
    };

    // Calculate days in period
    const daysInPeriod = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const weeksInPeriod = daysInPeriod / 7;

    // Calculate progress percentages
    const progress = {
      nutrition: {
        dailyCalories: user.goals.dailyCalorieGoal ? {
          target: user.goals.dailyCalorieGoal * daysInPeriod,
          actual: nutritionProgress.calories,
          percentage: Math.round((nutritionProgress.calories / (user.goals.dailyCalorieGoal * daysInPeriod)) * 100)
        } : null,
        
        dailyWater: user.goals.dailyWaterGoal ? {
          target: user.goals.dailyWaterGoal * daysInPeriod,
          actual: nutritionProgress.water,
          percentage: Math.round((nutritionProgress.water / (user.goals.dailyWaterGoal * daysInPeriod)) * 100)
        } : null,
        
        macros: {
          protein: user.goals.macroGoals?.protein ? {
            target: user.goals.macroGoals.protein * daysInPeriod,
            actual: nutritionProgress.protein,
            percentage: Math.round((nutritionProgress.protein / (user.goals.macroGoals.protein * daysInPeriod)) * 100)
          } : null,
          
          carbs: user.goals.macroGoals?.carbs ? {
            target: user.goals.macroGoals.carbs * daysInPeriod,
            actual: nutritionProgress.carbs,
            percentage: Math.round((nutritionProgress.carbs / (user.goals.macroGoals.carbs * daysInPeriod)) * 100)
          } : null,
          
          fat: user.goals.macroGoals?.fat ? {
            target: user.goals.macroGoals.fat * daysInPeriod,
            actual: nutritionProgress.fat,
            percentage: Math.round((nutritionProgress.fat / (user.goals.macroGoals.fat * daysInPeriod)) * 100)
          } : null
        }
      },
      
      fitness: {
        weeklyWorkouts: user.goals.weeklyWorkoutGoal ? {
          target: user.goals.weeklyWorkoutGoal * weeksInPeriod,
          actual: workoutProgress.totalWorkouts,
          percentage: Math.round((workoutProgress.totalWorkouts / (user.goals.weeklyWorkoutGoal * weeksInPeriod)) * 100)
        } : null,
        
        weeklyDuration: user.goals.weeklyWorkoutDuration ? {
          target: user.goals.weeklyWorkoutDuration * weeksInPeriod,
          actual: workoutProgress.totalDuration,
          percentage: Math.round((workoutProgress.totalDuration / (user.goals.weeklyWorkoutDuration * weeksInPeriod)) * 100)
        } : null
      }
    };

    res.json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end,
          daysInPeriod,
          weeksInPeriod: Math.round(weeksInPeriod * 10) / 10
        },
        goals: user.goals,
        progress,
        summary: {
          nutrition: nutritionProgress,
          fitness: workoutProgress
        }
      }
    });
  } catch (error) {
    console.error('Get goal progress error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching goal progress'
    });
  }
};

// @desc    Calculate recommended goals based on user profile
// @route   GET /api/goals/recommendations
// @access  Private
const getGoalRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Basic Metabolic Rate (BMR) calculation using Mifflin-St Jeor Equation
    let bmr = 0;
    if (user.weight && user.height && user.age && user.gender) {
      if (user.gender === 'male') {
        bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
      } else {
        bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
      }
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    // Total Daily Energy Expenditure (TDEE)
    const tdee = bmr * (activityMultipliers[user.activityLevel] || 1.55);

    // Goal-based calorie recommendations
    let calorieGoal = tdee;
    let weeklyWeightGoal = 0;

    switch (user.fitnessGoal) {
      case 'lose_weight':
        calorieGoal = tdee - 500; // 500 calorie deficit for ~0.5kg/week loss
        weeklyWeightGoal = -0.5;
        break;
      case 'gain_weight':
        calorieGoal = tdee + 500; // 500 calorie surplus for ~0.5kg/week gain
        weeklyWeightGoal = 0.5;
        break;
      case 'build_muscle':
        calorieGoal = tdee + 300; // Moderate surplus for muscle building
        weeklyWeightGoal = 0.25;
        break;
      default:
        calorieGoal = tdee;
        weeklyWeightGoal = 0;
    }

    // Macro recommendations (as percentage of calories)
    const proteinPercentage = user.fitnessGoal === 'build_muscle' ? 0.3 : 0.25;
    const fatPercentage = 0.25;
    const carbPercentage = 1 - proteinPercentage - fatPercentage;

    const recommendations = {
      dailyCalorieGoal: Math.round(calorieGoal),
      weeklyWeightGoal: weeklyWeightGoal,
      targetWeight: user.weight ? user.weight + (weeklyWeightGoal * 12) : null, // 12 weeks target
      
      macroGoals: {
        protein: Math.round((calorieGoal * proteinPercentage) / 4), // 4 calories per gram
        carbs: Math.round((calorieGoal * carbPercentage) / 4),
        fat: Math.round((calorieGoal * fatPercentage) / 9) // 9 calories per gram
      },
      
      dailyWaterGoal: (() => {
        if (user.goals?.dailyWaterGoal) return user.goals.dailyWaterGoal;
        
        // Base water intake calculation
        let baseWater = 2000; // Default 2L
        
        if (user.weight) {
          // More conservative calculation: 25-30ml per kg
          baseWater = Math.round(user.weight * 25);
        }
        
        // Adjust based on activity level
        const activityMultiplier = {
          sedentary: 1.0,
          lightly_active: 1.1,
          moderately_active: 1.2,
          very_active: 1.3,
          extremely_active: 1.4
        };
        
        baseWater = Math.round(baseWater * (activityMultiplier[user.activityLevel] || 1.0));
        
        // Cap at reasonable limits (1.5L - 4L)
        return Math.max(1500, Math.min(baseWater, 4000));
      })(),
      
      weeklyWorkoutGoal: user.fitnessGoal === 'improve_endurance' ? 5 : 4,
      weeklyWorkoutDuration: user.fitnessGoal === 'improve_endurance' ? 300 : 240, // minutes
      
      dailyStepGoal: user.activityLevel === 'sedentary' ? 8000 : 10000,
      
      explanation: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        approach: getApproachExplanation(user.fitnessGoal)
      }
    };

    res.json({
      success: true,
      data: {
        recommendations,
        currentGoals: user.goals,
        userProfile: {
          fitnessGoal: user.fitnessGoal,
          activityLevel: user.activityLevel,
          weight: user.weight,
          height: user.height,
          age: user.age,
          gender: user.gender
        }
      }
    });
  } catch (error) {
    console.error('Get goal recommendations error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error calculating goal recommendations'
    });
  }
};

// Helper function to get approach explanation
const getApproachExplanation = (fitnessGoal) => {
  const explanations = {
    lose_weight: 'Creating a moderate calorie deficit to lose weight safely at ~0.5kg per week',
    gain_weight: 'Creating a calorie surplus to gain weight at a healthy rate of ~0.5kg per week',
    build_muscle: 'Moderate calorie surplus with higher protein intake to support muscle growth',
    maintain_weight: 'Eating at maintenance calories to maintain current weight',
    improve_endurance: 'Balanced nutrition with focus on carbohydrates for energy and increased workout frequency'
  };
  return explanations[fitnessGoal] || 'Balanced approach for general fitness';
};

export {
  getGoals,
  updateGoals,
  getGoalProgress,
  getGoalRecommendations
};