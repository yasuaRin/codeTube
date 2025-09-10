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
          flex-wrap: wrap; /* allow wrapping on small screens */
        }
        .header-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .App-header h1 {
          margin: 0 0 5px 0;
          color: white;
        }
        .App-header p {
          margin: 0;
          opacity: 0.8;
          color: white;
        }
        .user-info {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap; /* allow wrapping on small screens */
        }
        .user-info p {
          margin: 0;
          font-size: 18px;
        }
        .logout-btn {
          padding: 8px 15px;
          background-color: #ff4757;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
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
          transition: background-color 0.2s, transform 0.2s;
        }
        .home-btn:hover,
        .dashboard-btn:hover {
          background-color: #d4d4d4;
          transform: translateY(-2px);
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .App-header {
            padding: 15px;
          }
          .user-info p {
            font-size: 16px;
          }
          .home-btn, .dashboard-btn, .logout-btn {
            padding: 6px 12px;
          }
        }

        @media (max-width: 768px) {
          .App-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .user-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .App-header {
            padding: 10px;
          }
          .App-header h1 {
            font-size: 1.2rem;
          }
          .App-header p {
            font-size: 0.85rem;
          }
          .user-info p {
            font-size: 14px;
          }
          .home-btn, .dashboard-btn, .logout-btn {
            font-size: 0.75rem;
            padding: 4px 8px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
