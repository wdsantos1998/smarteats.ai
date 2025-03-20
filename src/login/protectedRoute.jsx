import React from 'react';
import { AuthState } from './authState';

export function ProtectedRoute({ children, authState }) {
  if (authState !== AuthState.Authenticated) {
    return <div>Access Denied</div>;
  }
  return children;
}