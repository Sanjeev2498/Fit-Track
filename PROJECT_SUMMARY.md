# PowerCore - Fitness & Nutrition Tracking Web Application

## Project Overview

PowerCore is a comprehensive full-stack web application designed to help users track their fitness journey, monitor nutrition intake, set personalized goals, and participate in community challenges. The application provides an intuitive platform for health-conscious individuals to maintain consistency in their fitness routines while staying motivated through data-driven insights and social engagement.

## Key Features

- **User Authentication & Profile Management**: Secure registration and login system with personalized user profiles including fitness preferences, goals, and physical metrics
- **Workout Tracking**: Comprehensive workout logging with exercise details, sets, reps, weights, duration, and automatic calorie calculation
- **Meal & Nutrition Tracking**: Detailed meal logging with nutritional breakdown including calories, proteins, carbohydrates, and fats
- **Goal Setting & Progress Monitoring**: Personalized fitness goal creation with automatic progress tracking and achievement visualization
- **Community Challenges**: Interactive challenges where users can compete with others, track progress on leaderboards, and stay motivated
- **Real-time Dashboard**: Dynamic overview displaying daily activities, quick stats, recent workouts, meals, and active challenges
- **Responsive Design**: Mobile-first approach ensuring seamless experience across all devices

## Technology Stack

### Frontend Technologies
- **React.js 18.x**: Modern component-based JavaScript library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development and consistent styling
- **React Router**: Client-side routing for single-page application navigation
- **Axios**: HTTP client for making API requests to the backend
- **React Context API**: Global state management for authentication and user data
- **React Icons**: Comprehensive icon library for UI elements

### Backend Technologies
- **Node.js**: JavaScript runtime environment for server-side development
- **Express.js**: Fast and minimalist web application framework for Node.js
- **MongoDB**: NoSQL document database for flexible data storage
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB and Node.js
- **JWT (JSON Web Tokens)**: Secure authentication and authorization mechanism
- **bcryptjs**: Password hashing library for enhanced security
- **CORS**: Cross-Origin Resource Sharing middleware for API access

### Development Tools & Environment
- **npm**: Package manager for dependency management
- **Git**: Version control system for collaborative development
- **VS Code**: Primary code editor with extensions for enhanced productivity
- **Postman**: API testing and documentation tool
- **nodemon**: Development utility for automatic server restart

## Architecture & Design Patterns

The application follows a **three-tier architecture**:

1. **Presentation Layer (Frontend)**: React components with Tailwind CSS styling, handling user interactions and data visualization
2. **Application Layer (Backend)**: RESTful API endpoints with Express.js, implementing business logic through controllers and middleware
3. **Data Layer (Database)**: MongoDB with Mongoose schemas for data persistence and relationships

The backend implements the **MVC (Model-View-Controller)** pattern:
- **Models**: Database schemas defining data structure and validation rules
- **Controllers**: Business logic handling API requests and responses
- **Routes**: URL endpoints mapping to controller functions
- **Middleware**: Authentication, validation, and error handling functions

## Database Schema

- **User Model**: Personal information, fitness preferences, goals, and authentication data
- **Workout Model**: Exercise details, duration, calories burned, and user relationships
- **Meal Model**: Food items, nutritional information, meal types, and automatic calculation of totals
- **Challenge Model**: Community challenges with participant tracking, progress monitoring, and leaderboards

## Security Features

- Password hashing using bcrypt with salt rounds
- JWT-based authentication with token expiration
- Protected API routes requiring valid authentication
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

## Team Development Approach

This project was designed for a **4-person development team** with varying skill levels:
- **Team Lead**: Full-stack development, architecture design, and mentoring
- **Backend Developer**: API development, database management, and authentication
- **Frontend Developer**: UI/UX design, React components, and responsive styling
- **Quality Assurance**: Testing, documentation, bug fixes, and deployment preparation

## Project Outcomes

PowerCore successfully demonstrates modern web development practices, delivering a production-ready application with comprehensive features for fitness tracking. The project showcases proficiency in full-stack JavaScript development, database design, API architecture, responsive web design, and collaborative software engineering practices.

The application serves as both a functional fitness tracking platform and a comprehensive learning experience covering all aspects of contemporary web application development, from user authentication and data management to real-time updates and community engagement features.