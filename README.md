# FitFusion - Personalized Fitness & Nutrition Tracker

A comprehensive full-stack web application for tracking fitness goals, workouts, meals, and challenges.

## 🚀 Live Demo

- **Frontend**: [Deploy on Vercel](https://vercel.com)
- **Backend**: [Deploy on Railway/Render](https://railway.app)

## ✨ Features

- 🔐 User authentication and authorization
- 🎯 Personalized fitness goal setting and tracking
- 💪 Workout logging and management
- 🍽️ Meal planning and nutrition tracking
- 🏆 Fitness challenges and community features
- 📊 Progress visualization and analytics

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **bcryptjs** for password hashing
- **CORS** enabled

### Frontend
- **React.js** with modern hooks
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Icons**

## 📁 Project Structure

```
fitfusion/
├── controllers/          # Route controllers
│   ├── authController.js
│   ├── challengeController.js
│   ├── goalController.js
│   ├── mealController.js
│   └── workoutController.js
├── middleware/          # Custom middleware
│   └── auth.js
├── models/             # MongoDB models
│   ├── Challenge.js
│   ├── Meal.js
│   ├── User.js
│   └── Workout.js
├── routes/             # API routes
├── fitfusion-frontend/ # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── services/
│   └── public/
└── server.js          # Main server file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Sanjeev2498/Fit-Track.git
cd Fit-Track
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd fitfusion-frontend
npm install
cd ..
```

4. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitfusion
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
```

5. **Start the development servers**

Backend:
```bash
npm run dev
```

Frontend (in a new terminal):
```bash
cd fitfusion-frontend
npm start
```

The backend will run on `http://localhost:5000` and frontend on `http://localhost:3000`.

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Workouts
- `GET /api/workouts` - Get user workouts
- `POST /api/workouts` - Log new workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Meals
- `GET /api/meals` - Get user meals
- `POST /api/meals` - Log new meal
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal

### Challenges
- `GET /api/challenges` - Get available challenges
- `POST /api/challenges` - Create new challenge
- `POST /api/challenges/:id/join` - Join a challenge

## 🌐 Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set build command: `cd fitfusion-frontend && npm run build`
4. Set output directory: `fitfusion-frontend/build`
5. Add environment variables in Vercel dashboard

### Backend (Railway/Render)
1. Connect your GitHub repo
2. Set start command: `npm start`
3. Add environment variables
4. Update frontend API URLs to point to your deployed backend

## 🔧 Environment Variables

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key
```

## 👥 Team

- **Sanjeev** - Backend Development
- **Abhay** - Frontend Development  
- **Vansh** - Database Design
- **Vipul** - API Integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all team members for their contributions
- Inspired by modern fitness tracking applications
- Built with love for the fitness community