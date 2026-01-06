import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    currentValue: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
});

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Challenge description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challengeType: {
    type: String,
    enum: ['workout_count', 'workout_duration', 'calories_burned', 'weight_loss', 'step_count', 'water_intake', 'custom'],
    required: [true, 'Challenge type is required']
  },
  targetValue: {
    type: Number,
    required: [true, 'Target value is required'],
    min: [0, 'Target value cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['workouts', 'minutes', 'hours', 'calories', 'kg', 'steps', 'ml', 'liters', 'custom']
  },
  duration: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['fitness', 'nutrition', 'wellness', 'weight_management', 'endurance'],
    default: 'fitness'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  maxParticipants: {
    type: Number,
    min: [2, 'Challenge must allow at least 2 participants'],
    max: [1000, 'Challenge cannot exceed 1000 participants'],
    default: 50
  },
  participants: [participantSchema],
  rules: [{
    type: String,
    maxlength: [200, 'Rule cannot exceed 200 characters']
  }],
  prizes: [{
    position: {
      type: Number,
      min: 1
    },
    description: {
      type: String,
      maxlength: [100, 'Prize description cannot exceed 100 characters']
    }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
challengeSchema.index({ status: 1, isPublic: 1 });
challengeSchema.index({ challengeType: 1, difficulty: 1 });
challengeSchema.index({ 'duration.startDate': 1, 'duration.endDate': 1 });
challengeSchema.index({ creator: 1 });

// Virtual for participant count
challengeSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for days remaining
challengeSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const endDate = new Date(this.duration.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for completion rate
challengeSchema.virtual('completionRate').get(function() {
  if (this.participants.length === 0) return 0;
  const completedCount = this.participants.filter(p => p.isCompleted).length;
  return Math.round((completedCount / this.participants.length) * 100);
});

// Pre-save middleware to update status based on dates
challengeSchema.pre('save', function(next) {
  const now = new Date();
  const startDate = new Date(this.duration.startDate);
  const endDate = new Date(this.duration.endDate);

  if (this.status !== 'cancelled') {
    if (now < startDate) {
      this.status = 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      this.status = 'active';
    } else if (now > endDate) {
      this.status = 'completed';
    }
  }

  next();
});

// Method to check if user can join challenge
challengeSchema.methods.canUserJoin = function(userId) {
  // Check if challenge is active or upcoming
  if (!['upcoming', 'active'].includes(this.status)) {
    return { canJoin: false, reason: 'Challenge is not available for joining' };
  }

  // Check if user is already a participant
  const isParticipant = this.participants.some(p => p.user.toString() === userId.toString());
  if (isParticipant) {
    return { canJoin: false, reason: 'User is already participating in this challenge' };
  }

  // Check if challenge is full
  if (this.participants.length >= this.maxParticipants) {
    return { canJoin: false, reason: 'Challenge is full' };
  }

  return { canJoin: true };
};

// Method to add participant
challengeSchema.methods.addParticipant = function(userId) {
  const canJoin = this.canUserJoin(userId);
  if (!canJoin.canJoin) {
    throw new Error(canJoin.reason);
  }

  this.participants.push({
    user: userId,
    joinedAt: new Date(),
    progress: {
      currentValue: 0,
      lastUpdated: new Date()
    }
  });

  return this.save();
};

// Ensure virtuals are included in JSON output
challengeSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Challenge', challengeSchema);