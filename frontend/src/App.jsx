import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Base URL for our backend API
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function App() {
  // State variables to manage our application data
  const [username, setUsername] = useState(''); // Current username input
  const [currentUser, setCurrentUser] = useState(null); // Logged-in user data
  const [searchQuery, setSearchQuery] = useState(''); // Search input text
  const [searchResults, setSearchResults] = useState([]); // Results from YouTube search
  const [savedVideos, setSavedVideos] = useState([]); // User's saved videos
  const [activeTab, setActiveTab] = useState('search'); // Current active tab
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls

  // Function to set the current user
  const handleSetUser = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE}/api/user`, { username });
      setCurrentUser(response.data);
      localStorage.setItem('codetube_user', JSON.stringify(response.data));
      loadSavedVideos(response.data.id);
    } catch (error) {
      console.error('Error setting user:', error);
      alert('Error setting user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to search for coding videos
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search term');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_BASE}/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching videos:', error);
      alert('Error searching videos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save a video to user's collection
  const saveVideo = async (video) => {
    if (!currentUser) {
      alert('Please set a username first');
      return;
    }
    
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE}/api/save`, {
        userId: currentUser.id,
        videoId: video.id,
        title: video.title,
        channel: video.channel,
        thumbnail: video.thumbnail
      });
      alert('Video saved successfully!');
      loadSavedVideos(currentUser.id);
    } catch (error) {
      console.error('Error saving video:', error);
      alert(error.response?.data?.error || 'Error saving video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load user's saved videos
  const loadSavedVideos = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/saved/${userId}`);
      setSavedVideos(response.data);
    } catch (error) {
      console.error('Error loading saved videos:', error);
    }
  };

  // Function to update video progress
  const updateProgress = async (videoId, progress) => {
    try {
      await axios.put(`${API_BASE}/api/progress`, {
        userId: currentUser.id,
        videoId,
        progress: parseInt(progress)
      });
      loadSavedVideos(currentUser.id); // Reload to see the updated progress
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Function to remove a saved video
  const removeVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to remove this video?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE}/api/saved`, {
        data: { userId: currentUser.id, videoId }
      });
      loadSavedVideos(currentUser.id);
      alert('Video removed successfully!');
    } catch (error) {
      console.error('Error removing video:', error);
      alert('Error removing video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing user when component loads
  useEffect(() => {
    const savedUser = localStorage.getItem('codetube_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setUsername(user.username);
      loadSavedVideos(user.id);
    }
  }, []);

  // Main component render
  return (
    <div className="App">
      <header className="App-header">
        <h1>CodeTube</h1>
        <p>YouTube for Coding Tutorials</p>
        
        {/* User setup section */}
        {!currentUser ? (
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
        ) : (
          <div className="user-info">
            <p>Welcome, {currentUser.username}!</p>
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
        )}
      </header>

      {/* Main content - only show if user is logged in */}
      {currentUser && (
        <div className="main-content">
          {/* Tab navigation */}
          <div className="tabs">
            <button 
              className={activeTab === 'search' ? 'active' : ''}
              onClick={() => setActiveTab('search')}
            >
              Search
            </button>
            <button 
              className={activeTab === 'saved' ? 'active' : ''}
              onClick={() => setActiveTab('saved')}
            >
              Saved Videos ({savedVideos.length})
            </button>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          )}

          {/* Search tab content */}
          {activeTab === 'search' && (
            <div className="search-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search for coding tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={isLoading}
                />
                <button onClick={handleSearch} disabled={isLoading}>
                  Search
                </button>
              </div>

              {/* Search results */}
              <div className="results">
                {searchResults.length === 0 ? (
                  <p className="no-results">Enter a search term to find coding tutorials</p>
                ) : (
                  searchResults.map(video => (
                    <div key={video.id} className="video-card">
                      <img src={video.thumbnail} alt={video.title} />
                      <div className="video-info">
                        <h3>{video.title}</h3>
                        <p className="channel">{video.channel}</p>
                        <button 
                          onClick={() => saveVideo(video)}
                          disabled={isLoading}
                        >
                          Save Video
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Saved videos tab content */}
          {activeTab === 'saved' && (
            <div className="saved-videos">
              {savedVideos.length === 0 ? (
                <p className="no-saved">No saved videos yet. Search for coding tutorials and save them!</p>
              ) : (
                savedVideos.map(video => (
                  <div key={video.id} className="saved-video">
                    <img src={video.thumbnail} alt={video.title} />
                    <div className="video-details">
                      <h3>{video.title}</h3>
                      <p className="channel">{video.channel}</p>
                      <div className="progress-section">
                        <label>
                          Learning Progress:
                          <select 
                            value={video.progress} 
                            onChange={(e) => updateProgress(video.video_id, e.target.value)}
                            disabled={isLoading}
                          >
                            <option value="0">Not Started</option>
                            <option value="25">25% Complete</option>
                            <option value="50">50% Complete</option>
                            <option value="75">75% Complete</option>
                            <option value="100">Completed</option>
                          </select>
                        </label>
                        <span className="saved-date">
                          Saved on: {new Date(video.saved_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeVideo(video.video_id)}
                        disabled={isLoading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;