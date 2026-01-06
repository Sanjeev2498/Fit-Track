import React, { useState, useEffect } from 'react';
import { FiTarget, FiTrendingUp, FiEdit, FiSave, FiX, FiActivity, FiDroplet } from 'react-icons/fi';
import { goalsAPI } from '../services/api';
import { useApiCall } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Goals = () => {
  const [goals, setGoals] = useState(null);
  const [progress, setProgress] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedGoals, setEditedGoals] = useState({});
  const { execute, loading: apiLoading } = useApiCall();

  useEffect(() => {
    fetchGoals();
    fetchProgress();
    fetchRecommendations();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await goalsAPI.getGoals();
      const userGoals = response.data.data.goals || {};
      setGoals(userGoals);
      setEditedGoals({
        targetWeight: userGoals.targetWeight || '',
        weeklyWeightGoal: userGoals.weeklyWeightGoal || '',
        dailyCalorieGoal: userGoals.dailyCalorieGoal || '',
        dailyWaterGoal: userGoals.dailyWaterGoal || '',
        macroGoals: {
          protein: userGoals.macroGoals?.protein || '',
          carbs: userGoals.macroGoals?.carbs || '',
          fat: userGoals.macroGoals?.fat || ''
        },
        weeklyWorkoutGoal: userGoals.weeklyWorkoutGoal || '',
        weeklyWorkoutDuration: userGoals.weeklyWorkoutDuration || ''
      });
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Initialize with empty goals if fetch fails
      setGoals({});
      setEditedGoals({
        targetWeight: '',
        weeklyWeightGoal: '',
        dailyCalorieGoal: '',
        dailyWaterGoal: '',
        macroGoals: {
          protein: '',
          carbs: '',
          fat: ''
        },
        weeklyWorkoutGoal: '',
        weeklyWorkoutDuration: ''
      });
    }
  };

  const fetchProgress = async () => {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const response = await goalsAPI.getProgress({ startDate: weekAgo });
      setProgress(response.data.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await goalsAPI.getRecommendations();
      setRecommendations(response.data.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoals = async () => {
    console.log('Saving goals:', editedGoals); // Debug log
    
    // Convert string values to numbers where appropriate
    const processedGoals = {
      targetWeight: editedGoals.targetWeight ? parseFloat(editedGoals.targetWeight) : null,
      weeklyWeightGoal: editedGoals.weeklyWeightGoal ? parseFloat(editedGoals.weeklyWeightGoal) : null,
      dailyCalorieGoal: editedGoals.dailyCalorieGoal ? parseInt(editedGoals.dailyCalorieGoal) : null,
      dailyWaterGoal: editedGoals.dailyWaterGoal ? parseInt(editedGoals.dailyWaterGoal) : null,
      weeklyWorkoutGoal: editedGoals.weeklyWorkoutGoal ? parseInt(editedGoals.weeklyWorkoutGoal) : null,
      weeklyWorkoutDuration: editedGoals.weeklyWorkoutDuration ? parseInt(editedGoals.weeklyWorkoutDuration) : null,
      macroGoals: {
        protein: editedGoals.macroGoals?.protein ? parseFloat(editedGoals.macroGoals.protein) : null,
        carbs: editedGoals.macroGoals?.carbs ? parseFloat(editedGoals.macroGoals.carbs) : null,
        fat: editedGoals.macroGoals?.fat ? parseFloat(editedGoals.macroGoals.fat) : null
      }
    };

    // Remove null values
    const cleanedGoals = {};
    Object.keys(processedGoals).forEach(key => {
      if (processedGoals[key] !== null && processedGoals[key] !== undefined) {
        if (key === 'macroGoals') {
          const cleanedMacros = {};
          Object.keys(processedGoals[key]).forEach(macroKey => {
            if (processedGoals[key][macroKey] !== null && processedGoals[key][macroKey] !== undefined) {
              cleanedMacros[macroKey] = processedGoals[key][macroKey];
            }
          });
          if (Object.keys(cleanedMacros).length > 0) {
            cleanedGoals[key] = cleanedMacros;
          }
        } else {
          cleanedGoals[key] = processedGoals[key];
        }
      }
    });

    console.log('Processed goals:', cleanedGoals); // Debug log

    try {
      const result = await execute(() => goalsAPI.updateGoals({ goals: cleanedGoals }));
      
      console.log('Save result:', result); // Debug log
      
      if (result.success) {
        // Update the local state with the saved goals
        setGoals(result.data?.goals || cleanedGoals);
        setEditMode(false);
        fetchProgress(); // Refresh progress after updating goals
        alert('Goals saved successfully!'); // Temporary success feedback
      } else {
        console.error('Save failed:', result);
        alert(`Failed to save goals: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving goals:', error);
      alert(`Error saving goals: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCancelEdit = () => {
    setEditedGoals({
      targetWeight: goals?.targetWeight || '',
      weeklyWeightGoal: goals?.weeklyWeightGoal || '',
      dailyCalorieGoal: goals?.dailyCalorieGoal || '',
      dailyWaterGoal: goals?.dailyWaterGoal || '',
      macroGoals: {
        protein: goals?.macroGoals?.protein || '',
        carbs: goals?.macroGoals?.carbs || '',
        fat: goals?.macroGoals?.fat || ''
      },
      weeklyWorkoutGoal: goals?.weeklyWorkoutGoal || '',
      weeklyWorkoutDuration: goals?.weeklyWorkoutDuration || ''
    });
    setEditMode(false);
  };

  const updateGoal = (path, value) => {
    const keys = path.split('.');
    const updated = { ...editedGoals };
    let current = updated;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value === '' ? null : parseFloat(value) || parseInt(value) || value;
    setEditedGoals(updated);
  };

  const applyRecommendation = (field, value) => {
    updateGoal(field, value);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'text-success-600 bg-success-100';
    if (percentage >= 75) return 'text-primary-600 bg-primary-100';
    if (percentage >= 50) return 'text-warning-600 bg-warning-100';
    return 'text-error-600 bg-error-100';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'bg-success-500';
    if (percentage >= 75) return 'bg-primary-500';
    if (percentage >= 50) return 'bg-warning-500';
    return 'bg-error-500';
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
          <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600">Set and track your fitness goals</p>
        </div>
        {!editMode ? (
          <button 
            onClick={() => setEditMode(true)}
            className="btn-primary"
          >
            <FiEdit className="w-4 h-4 mr-2" />
            Edit Goals
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={handleCancelEdit}
              className="btn-secondary"
            >
              <FiX className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button 
              onClick={handleSaveGoals}
              disabled={apiLoading}
              className="btn-primary"
            >
              {apiLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <FiSave className="w-4 h-4 mr-2" />
              )}
              Save Goals
            </button>
          </div>
        )}
      </div>

      {/* Progress Overview */}
      {progress && !editMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {progress.progress?.nutrition?.dailyCalories && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Daily Calories</h3>
                <span className={`badge ${getProgressColor(progress.progress.nutrition.dailyCalories.percentage)}`}>
                  {progress.progress.nutrition.dailyCalories.percentage}%
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>{progress.progress.nutrition.dailyCalories.actual}</span>
                  <span>{progress.progress.nutrition.dailyCalories.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${getProgressBarColor(progress.progress.nutrition.dailyCalories.percentage)}`}
                    style={{ width: `${Math.min(progress.progress.nutrition.dailyCalories.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {progress.progress?.fitness?.weeklyWorkouts && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Weekly Workouts</h3>
                <span className={`badge ${getProgressColor(progress.progress.fitness.weeklyWorkouts.percentage)}`}>
                  {progress.progress.fitness.weeklyWorkouts.percentage}%
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>{progress.progress.fitness.weeklyWorkouts.actual}</span>
                  <span>{progress.progress.fitness.weeklyWorkouts.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${getProgressBarColor(progress.progress.fitness.weeklyWorkouts.percentage)}`}
                    style={{ width: `${Math.min(progress.progress.fitness.weeklyWorkouts.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {progress.progress?.nutrition?.dailyWater && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Daily Water</h3>
                <span className={`badge ${getProgressColor(progress.progress.nutrition.dailyWater.percentage)}`}>
                  {progress.progress.nutrition.dailyWater.percentage}%
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>{(progress.progress.nutrition.dailyWater.actual / 1000).toFixed(1)}L</span>
                  <span>{(progress.progress.nutrition.dailyWater.target / 1000).toFixed(1)}L</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${getProgressBarColor(progress.progress.nutrition.dailyWater.percentage)}`}
                    style={{ width: `${Math.min(progress.progress.nutrition.dailyWater.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {progress.progress?.nutrition?.macros?.protein && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Daily Protein</h3>
                <span className={`badge ${getProgressColor(progress.progress.nutrition.macros.protein.percentage)}`}>
                  {progress.progress.nutrition.macros.protein.percentage}%
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>{Math.round(progress.progress.nutrition.macros.protein.actual)}g</span>
                  <span>{Math.round(progress.progress.nutrition.macros.protein.target)}g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${getProgressBarColor(progress.progress.nutrition.macros.protein.percentage)}`}
                    style={{ width: `${Math.min(progress.progress.nutrition.macros.protein.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Goals */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>
          </div>
          <div className="space-y-4">
            {/* Weight Goals */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Weight Goals</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Target Weight (kg)</label>
                  {editMode ? (
                    <input
                      type="number"
                      className="input"
                      value={editedGoals.targetWeight || ''}
                      onChange={(e) => updateGoal('targetWeight', e.target.value)}
                      placeholder="70"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{goals?.targetWeight || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Weekly Goal (kg)</label>
                  {editMode ? (
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      value={editedGoals.weeklyWeightGoal || ''}
                      onChange={(e) => updateGoal('weeklyWeightGoal', e.target.value)}
                      placeholder="-0.5"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{goals?.weeklyWeightGoal || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Calorie Goals */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Nutrition Goals</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Daily Calories</label>
                  {editMode ? (
                    <input
                      type="number"
                      className="input"
                      value={editedGoals.dailyCalorieGoal || ''}
                      onChange={(e) => updateGoal('dailyCalorieGoal', e.target.value)}
                      placeholder="2000"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{goals?.dailyCalorieGoal || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Daily Water (ml)</label>
                  {editMode ? (
                    <div>
                      <input
                        type="number"
                        className="input"
                        value={editedGoals.dailyWaterGoal || ''}
                        onChange={(e) => updateGoal('dailyWaterGoal', e.target.value)}
                        placeholder="2000"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => updateGoal('dailyWaterGoal', 2000)}
                          className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          2L
                        </button>
                        <button
                          type="button"
                          onClick={() => updateGoal('dailyWaterGoal', 2500)}
                          className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          2.5L
                        </button>
                        <button
                          type="button"
                          onClick={() => updateGoal('dailyWaterGoal', 3000)}
                          className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          3L
                        </button>
                        <button
                          type="button"
                          onClick={() => updateGoal('dailyWaterGoal', 3500)}
                          className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          3.5L
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg font-semibold">
                      {goals?.dailyWaterGoal ? `${(goals.dailyWaterGoal / 1000).toFixed(1)}L` : 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Macro Goals */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Macro Goals (grams)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Protein</label>
                  {editMode ? (
                    <input
                      type="number"
                      className="input"
                      value={editedGoals.macroGoals?.protein || ''}
                      onChange={(e) => updateGoal('macroGoals.protein', e.target.value)}
                      placeholder="150"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{goals?.macroGoals?.protein || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Carbs</label>
                  {editMode ? (
                    <input
                      type="number"
                      className="input"
                      value={editedGoals.macroGoals?.carbs || ''}
                      onChange={(e) => updateGoal('macroGoals.carbs', e.target.value)}
                      placeholder="200"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{goals?.macroGoals?.carbs || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Fat</label>
                  {editMode ? (
                    <input
                      type="number"
                      className="input"
                      value={editedGoals.macroGoals?.fat || ''}
                      onChange={(e) => updateGoal('macroGoals.fat', e.target.value)}
                      placeholder="65"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{goals?.macroGoals?.fat || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Fitness Goals */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fitness Goals</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Weekly Workouts</label>
                  {editMode ? (
                    <input
                      type="number"
                      className="input"
                      value={editedGoals.weeklyWorkoutGoal || ''}
                      onChange={(e) => updateGoal('weeklyWorkoutGoal', e.target.value)}
                      placeholder="4"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{goals?.weeklyWorkoutGoal || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Weekly Duration (min)</label>
                  {editMode ? (
                    <input
                      type="number"
                      className="input"
                      value={editedGoals.weeklyWorkoutDuration || ''}
                      onChange={(e) => updateGoal('weeklyWorkoutDuration', e.target.value)}
                      placeholder="240"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{goals?.weeklyWorkoutDuration || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
              <p className="text-sm text-gray-600">Based on your profile and fitness goal</p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-primary-50 rounded-lg">
                <h4 className="font-medium text-primary-900 mb-2">Recommended Goals</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Daily Calories:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{recommendations.recommendations?.dailyCalorieGoal}</span>
                      {editMode && (
                        <button
                          onClick={() => applyRecommendation('dailyCalorieGoal', recommendations.recommendations.dailyCalorieGoal)}
                          className="text-primary-600 hover:text-primary-700 text-xs"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Daily Water:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{recommendations.recommendations?.dailyWaterGoal}ml</span>
                      {editMode && (
                        <button
                          onClick={() => applyRecommendation('dailyWaterGoal', recommendations.recommendations.dailyWaterGoal)}
                          className="text-primary-600 hover:text-primary-700 text-xs"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Weekly Workouts:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{recommendations.recommendations?.weeklyWorkoutGoal}</span>
                      {editMode && (
                        <button
                          onClick={() => applyRecommendation('weeklyWorkoutGoal', recommendations.recommendations.weeklyWorkoutGoal)}
                          className="text-primary-600 hover:text-primary-700 text-xs"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Your Profile</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Goal: {recommendations.userProfile?.fitnessGoal?.replace('_', ' ')}</p>
                  <p>Activity: {recommendations.userProfile?.activityLevel?.replace('_', ' ')}</p>
                  {recommendations.explanation && (
                    <p className="mt-2 text-xs">{recommendations.explanation.approach}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;