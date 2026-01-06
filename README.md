# FitFusion Backend

Personalized fitness & nutrition tracker API built with Node.js, Express, and MongoDB.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your MongoDB connection string:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitfusion
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

4. Test the API:
- Health check: `GET http://localhost:5000/api/health`
- Test route: `GET http://localhost:5000/api/test`

## Tech Stack
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing