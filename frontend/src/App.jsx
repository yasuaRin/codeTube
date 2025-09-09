// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // ✅ new password state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('codetube_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setUsername(user.username);
    }
  }, []);

  // ✅ handle login/signup with password
  const handleSetUser = async () => {
    if (!username.trim() || !password.trim()) return alert('Please enter username and password');
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/user`, { username, password });
      setCurrentUser(response.data);
      localStorage.setItem('codetube_user', JSON.stringify(response.data));
    } catch (error) {
      console.error(error);
      alert('Error setting user');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ centralized logout
  const handleLogout = () => {
    localStorage.removeItem('codetube_user');
    setCurrentUser(null);
    setUsername('');
    setPassword('');
  };

  return (
    <Router>
      <div className="App">
        <Header
          currentUser={currentUser}
          username={username}
          setUsername={setUsername}
          handleSetUser={handleSetUser}
          handleLogout={handleLogout} // ✅ pass down
          isLoading={isLoading}
        />

        <Routes>
          {/* "/" → Login/Register + Home */}
          <Route
            path="/"
            element={
              currentUser ? (
                <Home currentUser={currentUser} apiBase={API_BASE} />
              ) : (
                <div className="set-user-page">
                  <h2>Login or Register</h2>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button onClick={handleSetUser} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Submit'}
                  </button>
                </div>
              )
            }
          />

          {/* "/dashboard" → Saved videos & performance */}
          <Route
            path="/dashboard"
            element={
              currentUser ? (
                <Dashboard currentUser={currentUser} apiBase={API_BASE} />
              ) : (
                <Navigate to="/" />
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
