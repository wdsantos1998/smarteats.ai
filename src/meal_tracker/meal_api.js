//get meals
export async function getMeals() {
  try {
    const response = await fetch('/api/meals', { credentials: 'include' });
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Error fetching meals:", error);
    return [];
  }
}

//add meal
export async function addMeal(meal) {
  try {
    const response = await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meal),
      credentials: 'include',
    });
    return response.ok ? await response.json() : null;
  } catch (error) {
    console.error("Error adding meal:", error);
    return null;
  }
}

export async function updateMeal(id, updatedMeal) {
  try {
    const response = await fetch(`/api/meals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMeal),
      credentials: 'include',
    });
    return response.ok ? await response.json() : null;
  } catch (error) {
    console.error("Error updating meal:", error);
    return null;
  }
}

export async function deleteMeal(id) {
  try {
    const response = await fetch(`/api/meals/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting meal:", error);
    return false;
  }
}

export async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "DELETE",
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
      console.error("Error logging out:", error);
    return false;
  }
}