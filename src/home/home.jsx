import React, { useState, useEffect } from 'react';
import { getMeals, logout } from '../meal_tracker/meal_api';
import { useNavigate } from "react-router-dom"

export function Home() {
    const navigate = useNavigate()
    const [nutrients, setNutrients] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
    });

    const [chatMessages, setChatMessages] = useState([]);
    const [userInput, setUserInput] = useState('');

    //authenticate user
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
        async function fetchTodaysMeals() {
            const allMeals = await getMeals();
            const today = new Date().toISOString().split('T')[0];

            const todaysMeals = allMeals.filter(meal => meal.date.startsWith(today));
            
            setNutrients(todaysMeals.reduce(
                (totals, meal) => ({
                    calories: totals.calories + Number(meal.calories),
                    protein: totals.protein + Number(meal.protein),
                    carbs: totals.carbs + Number(meal.carbs),
                    fat: totals.fat + Number(meal.fat),
                }),
                { calories: 0, protein: 0, carbs: 0, fat: 0 }
            ));
        }
        fetchTodaysMeals();
    }, []);
    
    const handleUserInput = (e) => {
        setUserInput(e.target.value);
    };
    
    // const handleChatSubmit = (e) => {
    //     e.preventDefault();
    //     if (userInput.trim()) {
    //       const userMessage = { sender: 'User', text: userInput };
    //       const aiResponse = getAIResponse(userInput);
    
    //       setChatMessages([...chatMessages, userMessage, aiResponse]);
    //       setUserInput('');
    //     }
    // };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (userInput.trim()) {
            const userMessage = { sender: 'User', text: userInput };

            setChatMessages(prevMessages => [...prevMessages, userMessage]);

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ message: userInput })
                });

                const data = await response.json();

                if (response.ok) {
                    const aiMessage = { sender: 'AI', text: data.response };
                    setChatMessages(prevMessages => [...prevMessages, aiMessage]);
                } else {
                    console.error("Chatbot error:", data.error);
                    setChatMessages(prevMessages => [...prevMessages, { sender: 'AI', text: "Error: Could not fetch response." }]);
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setChatMessages(prevMessages => [...prevMessages, { sender: 'AI', text: "Network error. Please try again later." }]);
            }
            setUserInput('');
        }
    };

    // const getAIResponse = (userInput) => {
    //     return {
    //       sender: 'AI',
    //       text: `Based on "${userInput}", I estimate:
    //       - Calories: 500 kcal
    //       - Protein: 25g
    //       - Carbs: 60g
    //       - Fat: 20g`,
    //     };
    // };

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
                    <div className="chat-box">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className={`chat-bubble ${msg.sender === 'User' ? 'user' : 'ai'}`}>
                            <strong>{msg.sender}:</strong> {msg.text}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleChatSubmit} className="chat-input">
                        <textarea
                            placeholder="Enter what you ate..."
                            value={userInput}
                            onChange={handleUserInput}
                        />
                        <button type="submit">Go</button>
                    </form>
                </div>
        </main>
  );
}

