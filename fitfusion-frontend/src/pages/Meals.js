import React, { useState, useEffect } from 'react';
import { FiPlus, FiCoffee, FiDroplet, FiPieChart, FiCalendar } from 'react-icons/fi';
import { mealsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CreateMealModal from '../components/meals/CreateMealModal';

const Meals = () => {
  const [meals, setMeals] = useState([]);
  const [todayNutrition, setTodayNutrition] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchMeals();
    fetchTodayNutrition();
    fetchStats();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await mealsAPI.getMeals({ limit: 20 });
      setMeals(response.data.data.meals);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const fetchTodayNutrition = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await mealsAPI.getDailyNutrition(today);
      setTodayNutrition(response.data.data);
    } catch (error) {
      console.error('Error fetching today nutrition:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const response = await mealsAPI.getStats({ startDate: weekAgo });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealSuccess = () => {
    fetchMeals();
    fetchTodayNutrition();
    fetchStats();
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

  const getMealTypeIcon = (mealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[mealType] || '🍽️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meals</h1>
          <p className="text-gray-600">Track your nutrition and meal intake</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Log Meal
        </button>
      </div>

      {/* Today's Nutrition Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FiCoffee className="w-6 h-6 text-primary-600" />
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
            <div className="p-2 bg-success-100 rounded-lg">
              <FiPieChart className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Protein</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(todayNutrition?.dailyTotals?.protein || 0)}g
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <FiPieChart className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Carbs</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(todayNutrition?.dailyTotals?.carbs || 0)}g
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <FiDroplet className="w-6 h-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Water</p>
              <p className="text-2xl font-bold text-gray-900">
                {((todayNutrition?.dailyTotals?.water || 0) / 1000).toFixed(1)}L
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Meals by Type */}
      {todayNutrition && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Today's Meals</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(todayNutrition.mealsByType).map(([mealType, meals]) => (
              <div key={mealType} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">{getMealTypeIcon(mealType)}</span>
                  <h4 className="font-medium text-gray-900 capitalize">{mealType}</h4>
                </div>
                {meals.length > 0 ? (
                  <div className="space-y-2">
                    {meals.map((meal) => (
                      <div key={meal._id} className="text-sm">
                        <p className="font-medium text-gray-800">
                          {meal.title || `${meal.foodItems?.length || 0} items`}
                        </p>
                        <p className="text-gray-600">{meal.totalCalories || 0} calories</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No meals logged</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Meals */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recent Meals</h3>
        </div>
        <div className="space-y-4">
          {meals.length > 0 ? (
            meals.map((meal) => (
              <div key={meal._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getMealTypeIcon(meal.mealType)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {meal.mealType} {meal.title && `- ${meal.title}`}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {meal.foodItems?.length || 0} items • {Math.round(meal.totalMacros?.protein || 0)}g protein
                    </p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(meal.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{meal.totalCalories || 0} cal</p>
                  <p className="text-sm text-gray-600">
                    C: {Math.round(meal.totalMacros?.carbs || 0)}g • F: {Math.round(meal.totalMacros?.fat || 0)}g
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FiCoffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meals logged yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your nutrition by logging your first meal.</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Log Your First Meal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Stats */}
      {stats && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">This Week's Nutrition</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {Math.round(stats.overall?.avgCalories || 0)}
              </p>
              <p className="text-sm text-gray-600">Avg Daily Calories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">
                {Math.round(stats.overall?.avgProtein || 0)}g
              </p>
              <p className="text-sm text-gray-600">Avg Daily Protein</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-600">
                {((stats.overall?.totalWater || 0) / 1000).toFixed(1)}L
              </p>
              <p className="text-sm text-gray-600">Total Water This Week</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Meal Modal */}
      <CreateMealModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleMealSuccess}
      />
    </div>
  );
};

export default Meals;