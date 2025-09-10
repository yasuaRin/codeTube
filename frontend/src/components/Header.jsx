// Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({
  currentUser,
  handleLogout,
}) => {
  const navigate = useNavigate();

  const handleLogoutAndRedirect = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <>
      <header className="App-header">
        <div className="header-left">
          <h1>CodeTube</h1>
          <p>Elevate your Coding Skill</p>
        </div>

        {currentUser ? (
          <div className="user-info">
            <p>Welcome, {currentUser.username}!</p>

            <Link to="/" className="home-btn">
              Home
            </Link>
            <Link to="/dashboard" className="dashboard-btn">
              Dashboard
            </Link>

            <button onClick={handleLogoutAndRedirect} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <div />
        )}
      </header>

      <style>{`
        .App-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #282c34;
          padding: 20px;
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-bottom: 2px solid #ccc;
          flex-wrap: nowrap; /* Keep layout fixed */
        }
        .header-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .App-header h1 {
          margin: 0 0 5px 0;
          color: white;
          font-size: 1.5rem;
        }
        .App-header p {
          margin: 0;
          opacity: 0.8;
          color: white;
          font-size: 0.9rem;
        }
        .user-info {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 15px;
          flex-wrap: nowrap; /* Prevent wrapping */
        }
        .user-info p {
          margin: 0;
          font-size: 18px;
          white-space: nowrap;
        }
        .logout-btn {
          padding: 8px 15px;
          background-color: #ff4757;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .logout-btn:hover {
          background-color: #ff3742;
        }
        .home-btn,
        .dashboard-btn {
          padding: 8px 15px;
          background-color: white;
          color: #282c34;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          text-decoration: none;
          font-size: 0.9rem;
          transition: background-color 0.2s, transform 0.2s;
          white-space: nowrap;
        }
        .home-btn:hover,
        .dashboard-btn:hover {
          background-color: #d4d4d4;
          transform: translateY(-2px);
        }

        /* Responsive font scaling only, layout stays fixed */
        @media (max-width: 1024px) {
          .App-header h1 { font-size: 1.4rem; }
          .App-header p { font-size: 0.85rem; }
          .user-info p { font-size: 16px; }
          .home-btn, .dashboard-btn, .logout-btn { font-size: 0.85rem; padding: 6px 12px; }
        }

        @media (max-width: 768px) {
          .App-header h1 { font-size: 1.3rem; }
          .App-header p { font-size: 0.8rem; }
          .user-info p { font-size: 15px; }
          .home-btn, .dashboard-btn, .logout-btn { font-size: 0.8rem; padding: 5px 10px; }
        }

        @media (max-width: 480px) {
          .App-header h1 { font-size: 1.1rem; }
          .App-header p { font-size: 0.75rem; }
          .user-info p { font-size: 14px; }
          .home-btn, .dashboard-btn, .logout-btn { font-size: 0.75rem; padding: 4px 8px; }
        }
      `}</style>
    </>
  );
};

export default Header;
