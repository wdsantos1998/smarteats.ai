import React, { useState } from 'react';

export function Unauthenticated({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.email);
      } else {
        const errorData = await response.json();
        setError(errorData.msg);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // create user  
      const response = await fetch('/api/auth/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.email);
      } else {
        const errorData = await response.json();
        setError(errorData.msg);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="box-container">
      <h4>Login or Register</h4>
      <form onSubmit={handleLogin}>
        <div>
          <input 
            type="text" 
            placeholder="cougars@byu.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input 
            type="password" 
            placeholder="***"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button> 
        <button type="button" onClick={handleRegister}>Create Account</button>
      </form>
    </div>
  );
}
