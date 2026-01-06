import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food item name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    enum: ['grams', 'kg', 'ml', 'liters', 'cups', 'pieces', 'slices', 'tbsp', 'tsp'],
    default: 'grams'
  },
  calories: {
    type: Number,
    required: [true, 'Calories are required'],
    min: [0, 'Calories cannot be negative']
  },
  macros: {
    protein: {
      type: Number,
      min: [0, 'Protein cannot be negative'],
      default: 0
    },
    carbs: {
      type: Number,
      min: [0, 'Carbs cannot be negative'],
      default: 0
    },
    fat: {
      type: Number,
      min: [0, 'Fat cannot be negative'],
      default: 0
    },
    fiber: {
      type: Number,
      min: [0, 'Fiber cannot be negative'],
      default: 0
    },
    sugar: {
      type: Number,
      min: [0, 'Sugar cannot be negative'],
      default: 0
    }
  },
  micronutrients: {
    sodium: { type: Number, min: 0, default: 0 }, // mg
    potassium: { type: Number, min: 0, default: 0 }, // mg
    calcium: { type: Number, min: 0, default: 0 }, // mg
    iron: { type: Number, min: 0, default: 0 }, // mg
    vitaminC: { type: Number, min: 0, default: 0 }, // mg
    vitaminD: { type: Number, min: 0, default: 0 } // IU
  }
});

const mealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: [true, 'Meal type is required']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  foodItems: [foodItemSchema],
  totalCalories: {
    type: Number,
    min: [0, 'Total calories cannot be negative'],
    default: 0
  },
  totalMacros: {
    protein: { type: Number, min: 0, default: 0 },
    carbs: { type: Number, min: 0, default: 0 },
    fat: { type: Number, min: 0, default: 0 },
    fiber: { type: Number, min: 0, default: 0 },
    sugar: { type: Number, min: 0, default: 0 }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  waterIntake: {
    type: Number, // in ml
    min: [0, 'Water intake cannot be negative'],
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
mealSchema.index({ user: 1, date: -1 });
mealSchema.index({ user: 1, mealType: 1 });

// Pre-save middleware to calculate totals
mealSchema.pre('save', function(next) {
  // Calculate total calories and macros
  this.totalCalories = this.foodItems.reduce((total, item) => total + item.calories, 0);
  
  this.totalMacros.protein = this.foodItems.reduce((total, item) => total + item.macros.protein, 0);
  this.totalMacros.carbs = this.foodItems.reduce((total, item) => total + item.macros.carbs, 0);
  this.totalMacros.fat = this.foodItems.reduce((total, item) => total + item.macros.fat, 0);
  this.totalMacros.fiber = this.foodItems.reduce((total, item) => total + item.macros.fiber, 0);
  this.totalMacros.sugar = this.foodItems.reduce((total, item) => total + item.macros.sugar, 0);
  
  next();
});

// Virtual for total food items count
mealSchema.virtual('totalFoodItems').get(function() {
  return this.foodItems.length;
});

// Ensure virtuals are included in JSON output
mealSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Meal', mealSchema);