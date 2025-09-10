import React, { useState } from 'react'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function Login({ setCurrentUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return alert('Please enter username and password');
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/login`, {
        username,
        password,
      });
      setCurrentUser(response.data);
      localStorage.setItem('codetube_user', JSON.stringify(response.data));
      navigate('/');
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        alert('Invalid password');
      } else if (error.response?.status === 404) {
        alert('User not found. Please register first.');
        navigate('/register');
      } else {
        alert('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.title}>Welcome Back</h2>
        
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
          
          <div style={styles.passwordContainer}>
            <label style={styles.labelLeft}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <div style={styles.buttonContainer}>
            <button
              onClick={handleLogin}
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
              {isLoading ? 'Processing...' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: '1rem'
  },
  loginBox: {
    width: '100%',
    maxWidth: '30rem',
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    textAlign: 'center',
    color: '#1f2937'
  },
  dividerContainer: {
    marginBottom: '1.5rem',
    display: 'flex'
  },
  divider: {
    flexGrow: 1,
    borderTop: '1px solid #d1d5db'
  },
  labelLeft: {
    display: 'block',
    color: '#374151',
    marginBottom: '0.5rem',
    textAlign: 'left'
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  passwordContainer: {
    marginTop: '1.5rem'
  },
  buttonContainer: {
    marginTop: '2rem'
  },
  button: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'white',
    color: '#282c34',
    fontWeight: 'bold',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  }
};
