import React, { useState, useEffect } from 'react';
import { getMeals, addMeal, updateMeal, deleteMeal, logout } from './meal_api';
import { useNavigate } from "react-router-dom"

export function MealTracker() {
  const navigate = useNavigate()
  const [meals, setMeals] = useState([]);
  const [mealInput, setMealInput] = useState({
    food: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const isToday = (mealDate) => {
    const today = new Date().toISOString().split('T')[0];
    const mealDay = new Date(mealDate).toISOString().split('T')[0];
    return today === mealDay;
  };

  //Authenticating user
  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then(response => {
        if (!response.ok) {
          navigate('/');
            }
        })
            .catch(() => navigate('/'));
  }, [navigate]);

  //get meals (for today)
  useEffect(() => {
      async function fetchMeals() {
          const data = await getMeals();
          setMeals(data.filter(meal => isToday(meal.date)));
      }
      fetchMeals();
  }, []);


  const [nutrients, setNutrients] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });


  useEffect(() => {
    const totalCalories = meals.reduce((sum, meal) => sum + Number(meal.calories), 0);
    const totalProtein = meals.reduce((sum, meal) => sum + Number(meal.protein), 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + Number(meal.carbs), 0);
    const totalFat = meals.reduce((sum, meal) => sum + Number(meal.fat), 0);

    setNutrients({
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    });
  }, [meals]);


  const handleInputChange = (e) => {
    setMealInput({ ...mealInput, [e.target.name]: e.target.value });
  };


  const addNewMeal = async (e) => {
    e.preventDefault();
    if (mealInput.food.trim()) {
      const newMeal = await addMeal(mealInput);
      if (newMeal) {
        setMeals([...meals, newMeal]);
        setMealInput({ food: '', calories: '', protein: '', carbs: '', fat: '' });
      }
    }
  };


  const [editingIndex, setEditingIndex] = useState(null);
  const [editMeal, setEditMeal] = useState({
    food: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });


  const startEditing = (index, meal) => {
    setEditingIndex(index);
    setEditMeal(meal);
  };


  const handleEditChange = (field, value) => {
    setEditMeal((prevMeal) => ({
      ...prevMeal,
      [field]: value,
    }));
  };


  const saveEdit = async (index) => {
    const updatedMeal = await updateMeal(editMeal.id, editMeal);
    if (updatedMeal) {
      const updatedMeals = [...meals];
      updatedMeals[index] = updatedMeal;
      setMeals(updatedMeals);
      setEditingIndex(null);
    }
  };


  const removeMeal = async (id) => {
    const success = await deleteMeal(id);
    if (success) {
      setMeals(meals.filter((meal) => meal.id !== id));
    }
  };


  const handleLogout = async () => {
    const success = await logout()
    if (success) {
      navigate("/")
    }
  }

  
  return (
    <main>
      <div className="box-container">
      <div>
          <button onClick={handleLogout}>
            Logout
          </button>
      </div>
        <table>
          <thead>
            <tr>
              <th>Calories</th>
              <th>Protein</th>
              <th>Carbs</th>
              <th>Fat</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{nutrients.calories}</td>
              <td>{nutrients.protein}</td>
              <td>{nutrients.carbs}</td>
              <td>{nutrients.fat}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="box-container">
        <table>
          <thead>
            <tr>
              <th>Food</th>
              <th>Calories</th>
              <th>Protein (g)</th>
              <th>Carbs (g)</th>
              <th>Fat (g)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meals.length > 0 ? (
              meals.map((meal, index) => (
                <tr key={meal.id}>
                  <td>
                    {editingIndex === index ? (
                      <input 
                        type="text" 
                        value={editMeal.food} 
                        onChange={(e) => handleEditChange('food', e.target.value)}
                      />
                    ) : (
                      meal.food
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <input 
                        type="number" 
                        value={editMeal.calories} 
                        onChange={(e) => handleEditChange('calories', e.target.value)}
                      />
                    ) : (
                      meal.calories
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <input 
                        type="number" 
                        value={editMeal.protein} 
                        onChange={(e) => handleEditChange('protein', e.target.value)}
                      />
                    ) : (
                      meal.protein
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <input 
                        type="number" 
                        value={editMeal.carbs} 
                        onChange={(e) => handleEditChange('carbs', e.target.value)}
                      />
                    ) : (
                      meal.carbs
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <input 
                        type="number" 
                        value={editMeal.fat} 
                        onChange={(e) => handleEditChange('fat', e.target.value)}
                      />
                    ) : (
                      meal.fat
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <button onClick={() => saveEdit(index)}>Save</button>
                    ) : (
                      <>
                        <button onClick={() => startEditing(index, meal)}>Edit</button>
                        <button onClick={() => removeMeal(meal.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No meals added today</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="box-container">          
        <form onSubmit={addNewMeal}>
          <div>
            <label>Food:</label>
            <input type="text" name="food" value={mealInput.food} onChange={handleInputChange} required />
          </div>
          <div>
            <label>Calories:</label>
            <input type="number" name="calories" value={mealInput.calories} onChange={handleInputChange} required />
          </div>
          <div>
            <label>Protein (g):</label>
            <input type="number" name="protein" value={mealInput.protein} onChange={handleInputChange} required />
          </div>
          <div>
            <label>Carbs (g):</label>
            <input type="number" name="carbs" value={mealInput.carbs} onChange={handleInputChange} required />
          </div>
          <div>
            <label>Fat (g):</label>
            <input type="number" name="fat" value={mealInput.fat} onChange={handleInputChange} required />
          </div>
          <button type="submit">Add Meal</button>
        </form>
      </div>  
    </main>
  );
}