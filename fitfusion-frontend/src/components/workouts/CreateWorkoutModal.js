import React, { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { workoutsAPI } from '../../services/api';
import { useApiCall } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';

const CreateWorkoutModal = ({ isOpen, onClose, onSuccess }) => {
  const { execute, loading: apiLoading } = useApiCall();

  const [newWorkout, setNewWorkout] = useState({
    title: '',
    workoutType: 'mixed',
    duration: '',
    exercises: [
      {
        name: '',
        category: 'strength',
        sets: [{ reps: '', weight: '', duration: '', restTime: '' }]
      }
    ],
    totalCaloriesBurned: '',
    difficulty: 'intermediate',
    notes: ''
  });

  const resetForm = () => {
    setNewWorkout({
      title: '',
      workoutType: 'mixed',
      duration: '',
      exercises: [
        {
          name: '',
          category: 'strength',
          sets: [{ reps: '', weight: '', duration: '', restTime: '' }]
        }
      ],
      totalCaloriesBurned: '',
      difficulty: 'intermediate',
      notes: ''
    });
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    
    const workoutData = {
      ...newWorkout,
      duration: parseInt(newWorkout.duration),
      totalCaloriesBurned: parseInt(newWorkout.totalCaloriesBurned) || 0,
      exercises: newWorkout.exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({
          ...set,
          reps: parseInt(set.reps) || 0,
          weight: parseFloat(set.weight) || 0,
          duration: parseInt(set.duration) || 0,
          restTime: parseInt(set.restTime) || 0
        }))
      })),
      isCompleted: true
    };

    const result = await execute(() => workoutsAPI.createWorkout(workoutData));
    
    if (result.success) {
      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  const addExercise = () => {
    setNewWorkout({
      ...newWorkout,
      exercises: [
        ...newWorkout.exercises,
        {
          name: '',
          category: 'strength',
          sets: [{ reps: '', weight: '', duration: '', restTime: '' }]
        }
      ]
    });
  };

  const addSet = (exerciseIndex) => {
    const updatedExercises = [...newWorkout.exercises];
    updatedExercises[exerciseIndex].sets.push({ reps: '', weight: '', duration: '', restTime: '' });
    setNewWorkout({ ...newWorkout, exercises: updatedExercises });
  };

  const updateExercise = (exerciseIndex, field, value) => {
    const updatedExercises = [...newWorkout.exercises];
    updatedExercises[exerciseIndex][field] = value;
    setNewWorkout({ ...newWorkout, exercises: updatedExercises });
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...newWorkout.exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setNewWorkout({ ...newWorkout, exercises: updatedExercises });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Log New Workout</h2>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleCreateWorkout} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workout Title *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g., Upper Body Strength"
                  value={newWorkout.title}
                  onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workout Type
                </label>
                <select
                  className="input"
                  value={newWorkout.workoutType}
                  onChange={(e) => setNewWorkout({ ...newWorkout, workoutType: e.target.value })}
                >
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="mixed">Mixed</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="input"
                  placeholder="45"
                  value={newWorkout.duration}
                  onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories Burned
                </label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="300"
                  value={newWorkout.totalCaloriesBurned}
                  onChange={(e) => setNewWorkout({ ...newWorkout, totalCaloriesBurned: e.target.value })}
                />
              </div>
            </div>

            {/* Exercises */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Exercises</h3>
                <button
                  type="button"
                  onClick={addExercise}
                  className="btn-outline btn text-sm"
                >
                  <FiPlus className="w-4 h-4 mr-1" />
                  Add Exercise
                </button>
              </div>

              {newWorkout.exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Exercise Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="e.g., Bench Press"
                        value={exercise.name}
                        onChange={(e) => updateExercise(exerciseIndex, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        className="input"
                        value={exercise.category}
                        onChange={(e) => updateExercise(exerciseIndex, 'category', e.target.value)}
                      >
                        <option value="strength">Strength</option>
                        <option value="cardio">Cardio</option>
                        <option value="flexibility">Flexibility</option>
                        <option value="sports">Sports</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Sets */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Sets</h4>
                      <button
                        type="button"
                        onClick={() => addSet(exerciseIndex)}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        + Add Set
                      </button>
                    </div>
                    
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-4 gap-2 mb-2">
                        <input
                          type="number"
                          className="input text-sm"
                          placeholder="Reps"
                          value={set.reps}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                        />
                        <input
                          type="number"
                          step="0.5"
                          className="input text-sm"
                          placeholder="Weight (kg)"
                          value={set.weight}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                        />
                        <input
                          type="number"
                          className="input text-sm"
                          placeholder="Duration (s)"
                          value={set.duration}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'duration', e.target.value)}
                        />
                        <input
                          type="number"
                          className="input text-sm"
                          placeholder="Rest (s)"
                          value={set.restTime}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'restTime', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="input"
                rows="3"
                placeholder="How did the workout feel? Any observations..."
                value={newWorkout.notes}
                onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={apiLoading}
                className="btn-primary"
              >
                {apiLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </div>
                ) : (
                  'Save Workout'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkoutModal;