// Header.jsx
import React from 'react';

const Header = ({
  currentUser,
  username,
  setUsername,
  handleSetUser,
  activeTab,
  setActiveTab,
  setCurrentUser,
  setSavedVideos,
  isLoading,
}) => {
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
            <button
              onClick={() => setActiveTab('search')}
              className={`home-btn ${activeTab === 'search' ? 'active' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`dashboard-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('codetube_user');
                setCurrentUser(null);
                setUsername('');
                setSavedVideos([]);
              }}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="user-setup">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSetUser()}
              disabled={isLoading}
            />
            <button onClick={handleSetUser} disabled={isLoading}>
              {isLoading ? 'Setting Up...' : 'Set Username'}
            </button>
          </div>
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
        .user-setup {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .user-setup input {
          padding: 10px 15px;
          border: 2px solid #61dafb;
          border-radius: 4px;
          font-size: 16px;
          min-width: 200px;
        }
        .user-setup button {
          padding: 10px 20px;
          background-color: #61dafb;
          border: none;
          border-radius: 4px;
          color: #282c34;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .user-setup button:hover {
          background-color: #4fa8c5;
        }
        .user-setup button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .user-info {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 15px;
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
          transition: background-color 0.2s, transform 0.2s;
        }
        /* hover with higher specificity to override active */
        .user-info .home-btn:hover,
        .user-info .dashboard-btn:hover {
          background-color: #d4d4d4 !important;
          transform: translateY(-2px);
        }
        .home-btn:disabled,
        .dashboard-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .user-info .home-btn.active,
        .user-info .dashboard-btn.active {
          background-color: white;
          color: #282c34;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .user-info {
            flex-direction: column;
            gap: 10px;
          }
          .user-setup {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
