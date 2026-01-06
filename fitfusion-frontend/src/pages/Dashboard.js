import React, { useState, useEffect } from 'react';
import { FiActivity, FiCoffee, FiTarget, FiTrendingUp, FiPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { workoutsAPI, mealsAPI, goalsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CreateWorkoutModal from '../components/workouts/CreateWorkoutModal';
import CreateMealModal from '../components/meals/CreateMealModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    workoutStats: null,
    todayNutrition: null,
    recentWorkouts: [],
    todayMeals: [],
    goalProgress: null
  });
  const [loading, setLoading] = useState(true);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get date ranges
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Fetch all dashboard data in parallel
        const [workoutStatsRes, todayNutritionRes, recentWorkoutsRes, todayMealsRes, goalProgressRes] = await Promise.allSettled([
          workoutsAPI.getStats({ startDate: weekAgo }),
          mealsAPI.getDailyNutrition(today),
          workoutsAPI.getWorkouts({ limit: 5 }),
          mealsAPI.getMeals({ limit: 10 }),
          goalsAPI.getProgress({ startDate: weekAgo })
        ]);

        setDashboardData({
          workoutStats: workoutStatsRes.status === 'fulfilled' ? workoutStatsRes.value.data.data : null,
          todayNutrition: todayNutritionRes.status === 'fulfilled' ? todayNutritionRes.value.data.data : null,
          recentWorkouts: recentWorkoutsRes.status === 'fulfilled' ? recentWorkoutsRes.value.data.data.workouts : [],
          todayMeals: todayMealsRes.status === 'fulfilled' ? todayMealsRes.value.data.data.meals : [],
          goalProgress: goalProgressRes.status === 'fulfilled' ? goalProgressRes.value.data.data : null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const refreshDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [workoutStatsRes, todayNutritionRes, recentWorkoutsRes, todayMealsRes, goalProgressRes] = await Promise.allSettled([
        workoutsAPI.getStats({ startDate: weekAgo }),
        mealsAPI.getDailyNutrition(today),
        workoutsAPI.getWorkouts({ limit: 5 }),
        mealsAPI.getMeals({ limit: 10 }),
        goalsAPI.getProgress({ startDate: weekAgo })
      ]);

      setDashboardData({
        workoutStats: workoutStatsRes.status === 'fulfilled' ? workoutStatsRes.value.data.data : null,
        todayNutrition: todayNutritionRes.status === 'fulfilled' ? todayNutritionRes.value.data.data : null,
        recentWorkouts: recentWorkoutsRes.status === 'fulfilled' ? recentWorkoutsRes.value.data.data.workouts : [],
        todayMeals: todayMealsRes.status === 'fulfilled' ? todayMealsRes.value.data.data.meals : [],
        goalProgress: goalProgressRes.status === 'fulfilled' ? goalProgressRes.value.data.data : null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleWorkoutSuccess = () => {
    refreshDashboardData();
  };

  const handleMealSuccess = () => {
    refreshDashboardData();
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { workoutStats, todayNutrition, recentWorkouts, todayMeals, goalProgress } = dashboardData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Here's your fitness overview for today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FiActivity className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Workouts This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {workoutStats?.overall?.totalWorkouts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <FiCoffee className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Calories Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayNutrition?.dailyTotals?.calories || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <FiTarget className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Calorie Goal</p>
              <p className="text-2xl font-bold text-gray-900">
                {goalProgress?.progress?.nutrition?.dailyCalories?.percentage || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Water Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {((todayNutrition?.dailyTotals?.water || 0) / 1000).toFixed(1)}L
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Workouts</h3>
            <button 
              onClick={() => setShowWorkoutModal(true)}
              className="btn-outline btn text-sm"
            >
              <FiPlus className="w-4 h-4 mr-1" />
              Add Workout
            </button>
          </div>
          <div className="space-y-4">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout) => (
                <div key={workout._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{workout.title}</p>
                    <p className="text-sm text-gray-600">
                      {workout.exercises?.length || 0} exercises • {workout.duration || 0} minutes
                    </p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(workout.date)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${workout.isCompleted ? 'badge-success' : 'badge-warning'}`}>
                      {workout.isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {workout.totalCaloriesBurned || 0} cal
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FiActivity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No workouts yet</p>
                <button 
                  onClick={() => setShowWorkoutModal(true)}
                  className="btn-primary mt-2"
                >
                  Log Your First Workout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Today's Meals</h3>
            <button 
              onClick={() => setShowMealModal(true)}
              className="btn-outline btn text-sm"
            >
              <FiPlus className="w-4 h-4 mr-1" />
              Add Meal
            </button>
          </div>
          <div className="space-y-4">
            {todayNutrition && todayNutrition.totalMeals > 0 ? (
              Object.entries(todayNutrition.mealsByType).map(([mealType, meals]) => 
                meals.map((meal) => (
                  <div key={meal._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {meal.mealType} {meal.title && `- ${meal.title}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {meal.foodItems?.length || 0} items
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {meal.totalCalories || 0} cal
                    </span>
                  </div>
                ))
              ).flat()
            ) : (
              <div className="text-center py-8">
                <FiCoffee className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No meals logged today</p>
                <button 
                  onClick={() => setShowMealModal(true)}
                  className="btn-primary mt-2"
                >
                  Log Your First Meal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Charts */}
      {goalProgress && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
            </div>
            <div className="space-y-4">
              {goalProgress.progress?.nutrition?.dailyCalories && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Calorie Goal</span>
                    <span>{goalProgress.progress.nutrition.dailyCalories.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${Math.min(goalProgress.progress.nutrition.dailyCalories.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {goalProgress.progress?.fitness?.weeklyWorkouts && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Workout Goal</span>
                    <span>{goalProgress.progress.fitness.weeklyWorkouts.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-success-500 h-2 rounded-full"
                      style={{ width: `${Math.min(goalProgress.progress.fitness.weeklyWorkouts.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {goalProgress.progress?.nutrition?.dailyWater && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Water Goal</span>
                    <span>{goalProgress.progress.nutrition.dailyWater.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-secondary-500 h-2 rounded-full"
                      style={{ width: `${Math.min(goalProgress.progress.nutrition.dailyWater.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">This Week Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {workoutStats?.overall?.totalWorkouts || 0}
                </p>
                <p className="text-sm text-gray-600">Workouts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success-600">
                  {Math.floor((workoutStats?.overall?.totalDuration || 0) / 60)}h
                </p>
                <p className="text-sm text-gray-600">Exercise Time</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning-600">
                  {workoutStats?.overall?.totalCalories || 0}
                </p>
                <p className="text-sm text-gray-600">Calories Burned</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-600">
                  {Math.round((todayNutrition?.dailyTotals?.protein || 0))}g
                </p>
                <p className="text-sm text-gray-600">Protein Today</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowWorkoutModal(true)}
            className="btn-outline text-center py-4"
          >
            <FiActivity className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Log Workout</span>
          </button>
          <button 
            onClick={() => setShowMealModal(true)}
            className="btn-outline text-center py-4"
          >
            <FiCoffee className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Log Meal</span>
          </button>
          <a href="/goals" className="btn-outline text-center py-4">
            <FiTarget className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Update Goals</span>
          </a>
          <a href="/challenges" className="btn-outline text-center py-4">
            <FiTrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Join Challenge</span>
          </a>
        </div>
      </div>

      {/* Create Workout Modal */}
      <CreateWorkoutModal
        isOpen={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
        onSuccess={handleWorkoutSuccess}
      />
      
      <CreateMealModal
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        onSuccess={handleMealSuccess}
      />
    </div>
  );
};

export default Dashboard;