import React, { useState } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { mealsAPI } from '../../services/api';
import { useApiCall } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';

const CreateMealModal = ({ isOpen, onClose, onSuccess }) => {
  const { execute, loading: apiLoading } = useApiCall();

  const [newMeal, setNewMeal] = useState({
    mealType: 'breakfast',
    title: '',
    foodItems: [
      {
        name: '',
        quantity: '',
        unit: 'grams',
        calories: '',
        macros: {
          protein: '',
          carbs: '',
          fat: '',
          fiber: '',
          sugar: ''
        }
      }
    ],
    waterIntake: '',
    notes: ''
  });

  const resetForm = () => {
    setNewMeal({
      mealType: 'breakfast',
      title: '',
      foodItems: [
        {
          name: '',
          quantity: '',
          unit: 'grams',
          calories: '',
          macros: {
            protein: '',
            carbs: '',
            fat: '',
            fiber: '',
            sugar: ''
          }
        }
      ],
      waterIntake: '',
      notes: ''
    });
  };

  const handleCreateMeal = async (e) => {
    e.preventDefault();
    
    const mealData = {
      ...newMeal,
      waterIntake: parseInt(newMeal.waterIntake) || 0,
      foodItems: newMeal.foodItems.map(item => ({
        ...item,
        quantity: parseFloat(item.quantity) || 0,
        calories: parseInt(item.calories) || 0,
        macros: {
          protein: parseFloat(item.macros.protein) || 0,
          carbs: parseFloat(item.macros.carbs) || 0,
          fat: parseFloat(item.macros.fat) || 0,
          fiber: parseFloat(item.macros.fiber) || 0,
          sugar: parseFloat(item.macros.sugar) || 0
        }
      }))
    };

    const result = await execute(() => mealsAPI.createMeal(mealData));
    
    if (result.success) {
      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  const addFoodItem = () => {
    setNewMeal({
      ...newMeal,
      foodItems: [
        ...newMeal.foodItems,
        {
          name: '',
          quantity: '',
          unit: 'grams',
          calories: '',
          macros: {
            protein: '',
            carbs: '',
            fat: '',
            fiber: '',
            sugar: ''
          }
        }
      ]
    });
  };

  const removeFoodItem = (index) => {
    if (newMeal.foodItems.length > 1) {
      const updatedItems = newMeal.foodItems.filter((_, i) => i !== index);
      setNewMeal({ ...newMeal, foodItems: updatedItems });
    }
  };

  const updateFoodItem = (index, field, value) => {
    const updatedItems = [...newMeal.foodItems];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedItems[index][parent][child] = value;
    } else {
      updatedItems[index][field] = value;
    }
    setNewMeal({ ...newMeal, foodItems: updatedItems });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Log New Meal</h2>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleCreateMeal} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Type *
                </label>
                <select
                  required
                  className="input"
                  value={newMeal.mealType}
                  onChange={(e) => setNewMeal({ ...newMeal, mealType: e.target.value })}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Title
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Protein Smoothie"
                  value={newMeal.title}
                  onChange={(e) => setNewMeal({ ...newMeal, title: e.target.value })}
                />
              </div>
            </div>

            {/* Food Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Food Items</h3>
                <button
                  type="button"
                  onClick={addFoodItem}
                  className="btn-outline btn text-sm"
                >
                  <FiPlus className="w-4 h-4 mr-1" />
                  Add Food Item
                </button>
              </div>

              {newMeal.foodItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Food Item {index + 1}</h4>
                    {newMeal.foodItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFoodItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Food Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="e.g., Chicken Breast"
                        value={item.name}
                        onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.1"
                        className="input"
                        placeholder="100"
                        value={item.quantity}
                        onChange={(e) => updateFoodItem(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        className="input"
                        value={item.unit}
                        onChange={(e) => updateFoodItem(index, 'unit', e.target.value)}
                      >
                        <option value="grams">Grams</option>
                        <option value="kg">Kg</option>
                        <option value="ml">ML</option>
                        <option value="liters">Liters</option>
                        <option value="cups">Cups</option>
                        <option value="pieces">Pieces</option>
                        <option value="slices">Slices</option>
                        <option value="tbsp">Tbsp</option>
                        <option value="tsp">Tsp</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calories *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="input"
                        placeholder="165"
                        value={item.calories}
                        onChange={(e) => updateFoodItem(index, 'calories', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Macros */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Macronutrients (grams)</h5>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="input text-sm"
                        placeholder="Protein"
                        value={item.macros.protein}
                        onChange={(e) => updateFoodItem(index, 'macros.protein', e.target.value)}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="input text-sm"
                        placeholder="Carbs"
                        value={item.macros.carbs}
                        onChange={(e) => updateFoodItem(index, 'macros.carbs', e.target.value)}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="input text-sm"
                        placeholder="Fat"
                        value={item.macros.fat}
                        onChange={(e) => updateFoodItem(index, 'macros.fat', e.target.value)}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="input text-sm"
                        placeholder="Fiber"
                        value={item.macros.fiber}
                        onChange={(e) => updateFoodItem(index, 'macros.fiber', e.target.value)}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="input text-sm"
                        placeholder="Sugar"
                        value={item.macros.sugar}
                        onChange={(e) => updateFoodItem(index, 'macros.sugar', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Water Intake (ml)
                </label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="250"
                  value={newMeal.waterIntake}
                  onChange={(e) => setNewMeal({ ...newMeal, waterIntake: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="input"
                rows="3"
                placeholder="Any notes about this meal..."
                value={newMeal.notes}
                onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose}
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
                    Saving...
                  </div>
                ) : (
                  'Save Meal'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMealModal;