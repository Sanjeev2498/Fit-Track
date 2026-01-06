import React, { useState, useEffect } from 'react';
import { FiPlus, FiUsers, FiAward, FiCalendar, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { challengesAPI } from '../services/api';
import { useApiCall } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { execute, loading: apiLoading } = useApiCall();

  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    challengeType: 'workout_count',
    targetValue: '',
    unit: 'workouts',
    duration: {
      startDate: '',
      endDate: ''
    },
    difficulty: 'medium',
    category: 'fitness',
    maxParticipants: 50,
    isPublic: true
  });

  useEffect(() => {
    fetchChallenges();
    fetchMyChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await challengesAPI.getChallenges({ status: 'active', limit: 20 });
      setChallenges(response.data.data.challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchMyChallenges = async () => {
    try {
      const response = await challengesAPI.getUserChallenges();
      setMyChallenges(response.data.data.challenges);
    } catch (error) {
      console.error('Error fetching my challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    const result = await execute(() => challengesAPI.joinChallenge(challengeId));
    
    if (result.success) {
      fetchChallenges();
      fetchMyChallenges();
    }
  };

  const handleUpdateProgress = async (challengeId, currentProgress, targetValue) => {
    const newProgress = prompt(`Update your progress (current: ${currentProgress}/${targetValue}):`);
    
    if (newProgress !== null && !isNaN(newProgress)) {
      const result = await execute(() => challengesAPI.updateProgress(challengeId, parseFloat(newProgress)));
      
      if (result.success) {
        fetchMyChallenges();
      }
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    
    const challengeData = {
      ...newChallenge,
      targetValue: parseInt(newChallenge.targetValue),
      maxParticipants: parseInt(newChallenge.maxParticipants)
    };

    const result = await execute(() => challengesAPI.createChallenge(challengeData));
    
    if (result.success) {
      setShowCreateModal(false);
      setNewChallenge({
        title: '',
        description: '',
        challengeType: 'workout_count',
        targetValue: '',
        unit: 'workouts',
        duration: {
          startDate: '',
          endDate: ''
        },
        difficulty: 'medium',
        category: 'fitness',
        maxParticipants: 50,
        isPublic: true
      });
      fetchChallenges();
      fetchMyChallenges();
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-success-100 text-success-800',
      medium: 'bg-warning-100 text-warning-800',
      hard: 'bg-error-100 text-error-800'
    };
    return colors[difficulty] || colors.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      fitness: FiTarget,
      nutrition: FiTrendingUp,
      wellness: FiUsers,
      weight_management: FiAward,
      endurance: FiCalendar
    };
    return icons[category] || FiTarget;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
          <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
          <p className="text-gray-600">Join community fitness challenges and compete with others</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Create Challenge
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'browse'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Browse Challenges
          </button>
          <button
            onClick={() => setActiveTab('my-challenges')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-challenges'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Challenges ({myChallenges.length})
          </button>
        </nav>
      </div>

      {/* Browse Challenges Tab */}
      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.length > 0 ? (
            challenges.map((challenge) => {
              const CategoryIcon = getCategoryIcon(challenge.category);
              const isParticipant = challenge.participants?.some(p => p.user._id);
              
              return (
                <div key={challenge._id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary-100 rounded-lg mr-3">
                        <CategoryIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                        <span className={`badge ${getDifficultyColor(challenge.difficulty)} text-xs`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-medium">{challenge.targetValue} {challenge.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Participants:</span>
                      <span className="font-medium">{challenge.participantCount}/{challenge.maxParticipants}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Days left:</span>
                      <span className="font-medium">{getDaysRemaining(challenge.duration.endDate)} days</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {formatDate(challenge.duration.startDate)} - {formatDate(challenge.duration.endDate)}
                    </span>
                    {!isParticipant ? (
                      <button
                        onClick={() => handleJoinChallenge(challenge._id)}
                        disabled={apiLoading}
                        className="btn-primary text-sm"
                      >
                        Join Challenge
                      </button>
                    ) : (
                      <span className="badge-success text-xs">Joined</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active challenges</h3>
              <p className="text-gray-600 mb-4">Be the first to create a challenge for the community!</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Create First Challenge
              </button>
            </div>
          )}
        </div>
      )}

      {/* My Challenges Tab */}
      {activeTab === 'my-challenges' && (
        <div className="space-y-4">
          {myChallenges.length > 0 ? (
            myChallenges.map((challenge) => {
              const CategoryIcon = getCategoryIcon(challenge.category);
              const progressPercentage = challenge.userProgress ? 
                Math.round((challenge.userProgress.currentValue / challenge.targetValue) * 100) : 0;
              
              return (
                <div key={challenge._id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary-100 rounded-lg">
                        <CategoryIcon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`badge ${getDifficultyColor(challenge.difficulty)} text-xs`}>
                            {challenge.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getDaysRemaining(challenge.duration.endDate)} days left
                          </span>
                          {challenge.isCreator && (
                            <span className="badge-primary text-xs">Creator</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {challenge.userProgress?.currentValue || 0}
                        </span>
                        <span className="text-gray-600">/{challenge.targetValue}</span>
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{progressPercentage}% complete</p>
                      {challenge.status === 'active' && !challenge.userCompleted && (
                        <button
                          onClick={() => handleUpdateProgress(
                            challenge._id, 
                            challenge.userProgress?.currentValue || 0, 
                            challenge.targetValue
                          )}
                          className="btn-primary text-xs px-2 py-1"
                          disabled={apiLoading}
                        >
                          Update Progress
                        </button>
                      )}
                      {challenge.userCompleted && (
                        <span className="badge-success text-xs">Completed!</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <FiAward className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges joined yet</h3>
              <p className="text-gray-600 mb-4">Join a challenge to start competing with the community!</p>
              <button 
                onClick={() => setActiveTab('browse')}
                className="btn-primary"
              >
                Browse Challenges
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Challenge</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateChallenge} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Challenge Title *
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="30-Day Workout Challenge"
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      className="input"
                      rows="3"
                      placeholder="Complete 30 workouts in 30 days..."
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Challenge Type *
                    </label>
                    <select
                      className="input"
                      value={newChallenge.challengeType}
                      onChange={(e) => setNewChallenge({ ...newChallenge, challengeType: e.target.value })}
                    >
                      <option value="workout_count">Workout Count</option>
                      <option value="workout_duration">Workout Duration</option>
                      <option value="calories_burned">Calories Burned</option>
                      <option value="step_count">Step Count</option>
                      <option value="water_intake">Water Intake</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Value *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input"
                      placeholder="30"
                      value={newChallenge.targetValue}
                      onChange={(e) => setNewChallenge({ ...newChallenge, targetValue: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="input"
                      value={newChallenge.duration.startDate}
                      onChange={(e) => setNewChallenge({ 
                        ...newChallenge, 
                        duration: { ...newChallenge.duration, startDate: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="input"
                      value={newChallenge.duration.endDate}
                      onChange={(e) => setNewChallenge({ 
                        ...newChallenge, 
                        duration: { ...newChallenge.duration, endDate: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      className="input"
                      value={newChallenge.difficulty}
                      onChange={(e) => setNewChallenge({ ...newChallenge, difficulty: e.target.value })}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="1000"
                      className="input"
                      placeholder="50"
                      value={newChallenge.maxParticipants}
                      onChange={(e) => setNewChallenge({ ...newChallenge, maxParticipants: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
                        Creating...
                      </div>
                    ) : (
                      'Create Challenge'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;