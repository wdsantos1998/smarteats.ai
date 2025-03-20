import React from 'react';

export function Authenticated({ user, onLogout }) {
  return (
    <div className="box-container">
      <h4>Welcome, {user}!</h4>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
