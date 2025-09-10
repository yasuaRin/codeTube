// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading] = useState(false); // ✅ Removed setIsLoading to fix ESLint

  useEffect(() => {
    const savedUser = localStorage.getItem('codetube_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
    }
  }, []);

  // ✅ centralized logout
  const handleLogout = () => {
    localStorage.removeItem('codetube_user');
    setCurrentUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Header
          currentUser={currentUser}
          handleLogout={handleLogout}
          isLoading={isLoading}
        />

        <Routes>
          {/* "/" → Home or redirect */}
          <Route
            path="/"
            element={
              currentUser ? (
                <Home currentUser={currentUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Login page */}
          <Route
            path="/login"
            element={
              currentUser ? (
                <Navigate to="/" />
              ) : (
                <Login setCurrentUser={setCurrentUser} />
              )
            }
          />

          {/* Register page */}
          <Route
            path="/register"
            element={
              currentUser ? (
                <Navigate to="/" />
              ) : (
                <Register />
              )
            }
          />

          {/* "/dashboard" → Saved videos & performance */}
          <Route
            path="/dashboard"
            element={
              currentUser ? (
                <Dashboard currentUser={currentUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
