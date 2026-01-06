import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  age: {
    type: Number,
    min: [13, 'Must be at least 13 years old'],
    max: [120, 'Age cannot exceed 120']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  height: {
    type: Number, // in cm
    min: [50, 'Height must be at least 50cm'],
    max: [300, 'Height cannot exceed 300cm']
  },
  weight: {
    type: Number, // in kg
    min: [20, 'Weight must be at least 20kg'],
    max: [500, 'Weight cannot exceed 500kg']
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
    default: 'moderately_active'
  },
  fitnessGoal: {
    type: String,
    enum: ['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_endurance'],
    default: 'maintain_weight'
  },
  goals: {
    // Weight Goals
    targetWeight: {
      type: Number, // in kg
      min: [20, 'Target weight must be at least 20kg'],
      max: [500, 'Target weight cannot exceed 500kg']
    },
    weeklyWeightGoal: {
      type: Number, // kg per week (can be negative for weight loss)
      min: [-2, 'Weekly weight goal cannot be less than -2kg'],
      max: [2, 'Weekly weight goal cannot exceed 2kg']
    },
    
    // Calorie Goals
    dailyCalorieGoal: {
      type: Number,
      min: [800, 'Daily calorie goal must be at least 800'],
      max: [5000, 'Daily calorie goal cannot exceed 5000']
    },
    
    // Macro Goals (in grams)
    macroGoals: {
      protein: {
        type: Number,
        min: [0, 'Protein goal cannot be negative'],
        max: [500, 'Protein goal cannot exceed 500g']
      },
      carbs: {
        type: Number,
        min: [0, 'Carbs goal cannot be negative'],
        max: [1000, 'Carbs goal cannot exceed 1000g']
      },
      fat: {
        type: Number,
        min: [0, 'Fat goal cannot be negative'],
        max: [300, 'Fat goal cannot exceed 300g']
      }
    },
    
    // Water Goal
    dailyWaterGoal: {
      type: Number, // in ml
      min: [1000, 'Daily water goal must be at least 1L'],
      max: [5000, 'Daily water goal cannot exceed 5L'],
      default: 2000
    },
    
    // Workout Goals
    weeklyWorkoutGoal: {
      type: Number, // number of workouts per week
      min: [0, 'Weekly workout goal cannot be negative'],
      max: [14, 'Weekly workout goal cannot exceed 14']
    },
    weeklyWorkoutDuration: {
      type: Number, // total minutes per week
      min: [0, 'Weekly workout duration cannot be negative'],
      max: [2520, 'Weekly workout duration cannot exceed 42 hours']
    },
    
    // Step Goal
    dailyStepGoal: {
      type: Number,
      min: [1000, 'Daily step goal must be at least 1000'],
      max: [50000, 'Daily step goal cannot exceed 50000'],
      default: 10000
    },
    
    // Goal Timeline
    goalDeadline: {
      type: Date
    },
    
    // Goal Status
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model('User', userSchema);