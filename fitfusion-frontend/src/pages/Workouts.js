import React, { useState, useEffect } from 'react';
import { FiPlus, FiActivity, FiClock, FiCalendar } from 'react-icons/fi';
import { workoutsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CreateWorkoutModal from '../components/workouts/CreateWorkoutModal';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);



  useEffect(() => {
    fetchWorkouts();
    fetchStats();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await workoutsAPI.getWorkouts({ limit: 20 });
      setWorkouts(response.data.data.workouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [weekStats, monthStats] = await Promise.all([
        workoutsAPI.getStats({ startDate: weekAgo }),
        workoutsAPI.getStats({ startDate: monthAgo })
      ]);
      
      setStats({
        week: weekStats.data.data,
        month: monthStats.data.data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutSuccess = () => {
    fetchWorkouts();
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
          <h1 className="text-2xl font-bold text-gray-900">Workouts</h1>
          <p className="text-gray-600">Track and manage your workout sessions</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          New Workout
        </button>
      </div>

      {/* Workout Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FiActivity className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.week?.overall?.totalWorkouts || 0} workouts
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <FiClock className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor((stats?.week?.overall?.totalDuration || 0) / 60)}h {(stats?.week?.overall?.totalDuration || 0) % 60}m
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <FiCalendar className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.month?.overall?.totalWorkouts || 0} workouts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recent Workouts</h3>
        </div>
        <div className="space-y-4">
          {workouts.length > 0 ? (
            workouts.map((workout) => (
              <div key={workout._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FiActivity className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{workout.title}</h4>
                    <p className="text-sm text-gray-600">
                      {workout.exercises?.length || 0} exercises • {workout.duration || 0} minutes
                    </p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(workout.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${workout.isCompleted ? 'badge-success' : 'badge-warning'}`}>
                    {workout.isCompleted ? 'Completed' : 'In Progress'}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{workout.totalCaloriesBurned || 0} calories</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FiActivity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your fitness journey by logging your first workout.</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Log Your First Workout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Workout Modal */}
      <CreateWorkoutModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleWorkoutSuccess}
      />
    </div>
  );
};

export default Workouts;