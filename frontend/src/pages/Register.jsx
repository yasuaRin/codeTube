import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return alert('All fields are required');
    }
    if (password !== confirmPassword) {
      return alert('Passwords do not match');
    }
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/api/register`, {
        username,
        email,
        password,
      });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error(error);
      if (error.response?.status === 409) {
        alert('Username or email already exists');
      } else {
        alert('Failed to register');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.title}>Create Account</h2>
        
        <div style={styles.dividerContainer}>
          <div style={styles.divider}></div>
          <div style={styles.divider}></div>
        </div>

        <div>
          <div>
            <label style={styles.labelLeft}>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <div style={styles.fieldContainer}>
            <label style={styles.labelLeft}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <div style={styles.fieldContainer}>
            <label style={styles.labelLeft}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <div style={styles.fieldContainer}>
            <label style={styles.labelLeft}>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <div style={styles.buttonContainer}>
            <button
              onClick={handleRegister}
              disabled={isLoading}
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : {}),
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = 'white';
                }
              }}
            >
              {isLoading ? 'Processing...' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', // Changed for perfect vertical centering
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: '1rem'
  },
  loginBox: {
    width: '100%',
    maxWidth: '24rem',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    textAlign: 'center',
    color: '#1f2937'
  },
  dividerContainer: {
    marginBottom: '1rem',
    display: 'flex'
  },
  divider: {
    flexGrow: 1,
    borderTop: '1px solid #d1d5db'
  },
  labelLeft: {
    display: 'block',
    color: '#374151',
    marginBottom: '0.4rem',
    textAlign: 'left',
    fontSize: '0.9rem'
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.8rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.4rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '0.9rem'
  },
  fieldContainer: {
    marginTop: '1rem'
  },
  buttonContainer: {
    marginTop: '1.5rem'
  },
  button: {
    width: '100%',
    padding: '0.6rem 0.8rem',
    backgroundColor: 'white',
    color: '#282c34',
    fontWeight: 'bold',
    borderRadius: '0.4rem',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '0.9rem'
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  }
};
