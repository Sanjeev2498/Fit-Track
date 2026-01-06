import React, { useState, useEffect } from 'react';
import { FiUser, FiEdit, FiSave, FiX, FiActivity, FiTrendingUp, FiAward, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, workoutsAPI, mealsAPI, challengesAPI } from '../services/api';
import { useApiCall } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const { execute, loading: apiLoading } = useApiCall();

  useEffect(() => {
    if (user) {
      setEditedProfile({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        gender: user.gender || '',
        height: user.height || '',
        weight: user.weight || '',
        activityLevel: user.activityLevel || 'moderately_active',
        fitnessGoal: user.fitnessGoal || 'maintain_weight'
      });
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [workoutStats, mealStats, challengeStats] = await Promise.allSettled([
        workoutsAPI.getStats({ startDate: monthAgo }),
        mealsAPI.getStats({ startDate: monthAgo }),
        challengesAPI.getUserChallenges()
      ]);

      setStats({
        workouts: workoutStats.status === 'fulfilled' ? workoutStats.value.data.data : null,
        meals: mealStats.status === 'fulfilled' ? mealStats.value.data.data : null,
        challenges: challengeStats.status === 'fulfilled' ? challengeStats.value.data.data.challenges : []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    // Note: This would typically update the user profile via an API
    // For now, we'll just update the local state
    const updatedUser = { ...user, ...editedProfile };
    updateUser(updatedUser);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditedProfile({
      name: user.name || '',
      email: user.email || '',
      age: user.age || '',
      gender: user.gender || '',
      height: user.height || '',
      weight: user.weight || '',
      activityLevel: user.activityLevel || 'moderately_active',
      fitnessGoal: user.fitnessGoal || 'maintain_weight'
    });
    setEditMode(false);
  };

  const updateField = (field, value) => {
    setEditedProfile({
      ...editedProfile,
      [field]: value
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion');
      return;
    }

    const confirmed = window.confirm(
      'Are you absolutely sure? This action cannot be undone. All your data including workouts, meals, goals, and challenges will be permanently deleted.'
    );

    if (!confirmed) return;

    const result = await execute(() => authAPI.deleteAccount());
    
    if (result.success) {
      alert('Your account has been successfully deleted. You will now be logged out.');
      logout(); // This will redirect to login page
    } else {
      alert(`Failed to delete account: ${result.error || 'Unknown error'}`);
    }
  };

  const calculateBMI = () => {
    if (user?.height && user?.weight) {
      const heightInM = user.height / 100;
      const bmi = user.weight / (heightInM * heightInM);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-success-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-warning-600' };
    return { category: 'Obese', color: 'text-error-600' };
  };

  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account and fitness information</p>
        </div>
        {!editMode ? (
          <button 
            onClick={() => setEditMode(true)}
            className="btn-primary"
          >
            <FiEdit className="w-4 h-4 mr-2" />
            Edit Profile
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
              onClick={handleSaveProfile}
              disabled={apiLoading}
              className="btn-primary"
            >
              {apiLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <FiSave className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    className="input"
                    value={editedProfile.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    className="input"
                    value={editedProfile.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                {editMode ? (
                  <input
                    type="number"
                    min="13"
                    max="120"
                    className="input"
                    value={editedProfile.age}
                    onChange={(e) => updateField('age', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user?.age || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                {editMode ? (
                  <select
                    className="input"
                    value={editedProfile.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium capitalize">{user?.gender || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                {editMode ? (
                  <input
                    type="number"
                    min="50"
                    max="300"
                    className="input"
                    value={editedProfile.height}
                    onChange={(e) => updateField('height', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user?.height ? `${user.height} cm` : 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                {editMode ? (
                  <input
                    type="number"
                    min="20"
                    max="500"
                    className="input"
                    value={editedProfile.weight}
                    onChange={(e) => updateField('weight', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user?.weight ? `${user.weight} kg` : 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Fitness Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Level
                </label>
                {editMode ? (
                  <select
                    className="input"
                    value={editedProfile.activityLevel}
                    onChange={(e) => updateField('activityLevel', e.target.value)}
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="lightly_active">Lightly Active</option>
                    <option value="moderately_active">Moderately Active</option>
                    <option value="very_active">Very Active</option>
                    <option value="extremely_active">Extremely Active</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium capitalize">
                    {user?.activityLevel?.replace('_', ' ') || 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fitness Goal
                </label>
                {editMode ? (
                  <select
                    className="input"
                    value={editedProfile.fitnessGoal}
                    onChange={(e) => updateField('fitnessGoal', e.target.value)}
                  >
                    <option value="lose_weight">Lose Weight</option>
                    <option value="maintain_weight">Maintain Weight</option>
                    <option value="gain_weight">Gain Weight</option>
                    <option value="build_muscle">Build Muscle</option>
                    <option value="improve_endurance">Improve Endurance</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium capitalize">
                    {user?.fitnessGoal?.replace('_', ' ') || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats and BMI */}
        <div className="space-y-6">
          {/* BMI Card */}
          {bmi && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">BMI</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{bmi}</div>
                <div className={`text-sm font-medium ${bmiInfo.color}`}>
                  {bmiInfo.category}
                </div>
              </div>
            </div>
          )}

          {/* Account Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Account</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Member since</p>
                <p className="font-medium">{formatJoinDate(user?.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg mr-3">
                    <FiActivity className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Workouts</p>
                    <p className="font-semibold">{stats.workouts?.overall?.totalWorkouts || 0}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="p-2 bg-success-100 rounded-lg mr-3">
                    <FiTrendingUp className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Daily Calories</p>
                    <p className="font-semibold">{Math.round(stats.meals?.overall?.avgCalories || 0)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="p-2 bg-warning-100 rounded-lg mr-3">
                    <FiAward className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Challenges</p>
                    <p className="font-semibold">
                      {stats.challenges?.filter(c => c.status === 'active').length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="card border-error-200">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-error-900 flex items-center">
                <FiAlertTriangle className="w-5 h-5 mr-2" />
                Danger Zone
              </h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-error-50 rounded-lg border border-error-200">
                <h4 className="font-medium text-error-900 mb-2">Delete Account</h4>
                <p className="text-sm text-error-700 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                  All your workouts, meals, goals, and challenge data will be lost forever.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-danger flex items-center"
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-error-100 rounded-lg mr-3">
                  <FiAlertTriangle className="w-6 h-6 text-error-600" />
                </div>
                <h2 className="text-xl font-bold text-error-900">Delete Account</h2>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  This action will permanently delete your account and all associated data:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                  <li>All workout logs and exercise data</li>
                  <li>All meal logs and nutrition data</li>
                  <li>All goals and progress tracking</li>
                  <li>All challenge participations</li>
                  <li>Your profile and account information</li>
                </ul>
                <p className="text-error-700 font-medium">
                  This action cannot be undone!
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type "DELETE" to confirm:
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Type DELETE here"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={apiLoading || deleteConfirmation !== 'DELETE'}
                  className="btn-danger"
                >
                  {apiLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Deleting...
                    </div>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;