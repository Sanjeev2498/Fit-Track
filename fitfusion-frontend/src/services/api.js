import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  deleteAccount: () => api.delete('/auth/account'),
};

// Workouts API
export const workoutsAPI = {
  getWorkouts: (params = {}) => api.get('/workouts', { params }),
  getWorkout: (id) => api.get(`/workouts/${id}`),
  createWorkout: (workoutData) => api.post('/workouts', workoutData),
  updateWorkout: (id, workoutData) => api.put(`/workouts/${id}`, workoutData),
  deleteWorkout: (id) => api.delete(`/workouts/${id}`),
  getStats: (params = {}) => api.get('/workouts/stats', { params }),
};

// Meals API
export const mealsAPI = {
  getMeals: (params = {}) => api.get('/meals', { params }),
  getMeal: (id) => api.get(`/meals/${id}`),
  createMeal: (mealData) => api.post('/meals', mealData),
  updateMeal: (id, mealData) => api.put(`/meals/${id}`, mealData),
  deleteMeal: (id) => api.delete(`/meals/${id}`),
  getDailyNutrition: (date) => api.get(`/meals/daily/${date}`),
  getStats: (params = {}) => api.get('/meals/stats', { params }),
};

// Goals API
export const goalsAPI = {
  getGoals: () => api.get('/goals'),
  updateGoals: (goalsData) => api.put('/goals', goalsData),
  getProgress: (params = {}) => api.get('/goals/progress', { params }),
  getRecommendations: () => api.get('/goals/recommendations'),
};

// Challenges API
export const challengesAPI = {
  getChallenges: (params = {}) => api.get('/challenges', { params }),
  getChallenge: (id) => api.get(`/challenges/${id}`),
  createChallenge: (challengeData) => api.post('/challenges', challengeData),
  joinChallenge: (id) => api.post(`/challenges/${id}/join`),
  leaveChallenge: (id) => api.post(`/challenges/${id}/leave`),
  updateProgress: (id, progress) => api.put(`/challenges/${id}/progress`, { progress }),
  getUserChallenges: (params = {}) => api.get('/challenges/my-challenges', { params }),
  getLeaderboard: (id) => api.get(`/challenges/${id}/leaderboard`),
};

export default api;