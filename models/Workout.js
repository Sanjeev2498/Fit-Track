import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'sports', 'other'],
    default: 'other'
  },
  sets: [{
    reps: {
      type: Number,
      min: [0, 'Reps cannot be negative']
    },
    weight: {
      type: Number, // in kg
      min: [0, 'Weight cannot be negative']
    },
    duration: {
      type: Number, // in seconds
      min: [0, 'Duration cannot be negative']
    },
    distance: {
      type: Number, // in meters
      min: [0, 'Distance cannot be negative']
    },
    restTime: {
      type: Number, // in seconds
      min: [0, 'Rest time cannot be negative']
    }
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Workout title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in minutes
    min: [0, 'Duration cannot be negative'],
    max: [1440, 'Duration cannot exceed 24 hours']
  },
  exercises: [exerciseSchema],
  totalCaloriesBurned: {
    type: Number,
    min: [0, 'Calories cannot be negative'],
    default: 0
  },
  workoutType: {
    type: String,
    enum: ['strength', 'cardio', 'mixed', 'flexibility', 'sports'],
    default: 'mixed'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, workoutType: 1 });

// Virtual for total exercises count
workoutSchema.virtual('totalExercises').get(function() {
  return this.exercises.length;
});

// Virtual for total sets count
workoutSchema.virtual('totalSets').get(function() {
  return this.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
});

// Ensure virtuals are included in JSON output
workoutSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Workout', workoutSchema);