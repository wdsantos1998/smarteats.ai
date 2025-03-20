import React from 'react';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Login } from "./login/login";
import { Home } from "./home/home";
import { MealTracker } from "./meal_tracker/meal_tracker";

export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

function AppContent() {
    const location = useLocation();
    const hideNav = location.pathname === '/';

    return (
        <div className="body">
            <header>
                <h1>SmartEats.AI</h1>
                {!hideNav && (
                    <nav>
                        <NavLink to="/home">Home</NavLink> |
                        <NavLink to="/meal_tracker">Meal Tracker</NavLink>
                    </nav>
                )}
            </header>

            <Routes>
                <Route path='/' element={<Login />} exact />
                <Route path='/home' element={<Home />} />
                <Route path='/meal_tracker' element={<MealTracker />} />
                <Route path='*' element={<NotFound />} />
            </Routes>
        </div>
    );
}

function NotFound() {
    return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}
