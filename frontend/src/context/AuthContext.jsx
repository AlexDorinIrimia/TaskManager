// src/context/AuthContext.js
// Stores whether the user is logged in and their JWT token.
// Any component can read this with: const { user, logout } = useAuth();

import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // On startup, check if a token was already saved (e.g. page refresh)
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));

  function saveLogin(token, username) {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    setToken(token);
    setUsername(username);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
  }

  return (
    <AuthContext.Provider value={{ token, username, saveLogin, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component instead of useContext(AuthContext)
export function useAuth() {
  return useContext(AuthContext);
}
