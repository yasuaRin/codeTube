import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { FaBookmark } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function App() {
  const [username, setUsername] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [isLoading, setIsLoading] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [notification, setNotification] = useState(''); // popup notification

  const handleSetUser = async () => {
    if (!username.trim()) return alert('Please enter a username');
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE}/api/user`, { username });
      setCurrentUser(response.data);
      localStorage.setItem('codetube_user', JSON.stringify(response.data));
      loadSavedVideos(response.data.id);
      handleSearch('');
    } catch (error) {
      console.error(error);
      alert('Error setting user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query = searchQuery) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error(error);
      alert('Error searching videos');
    } finally {
      setIsLoading(false);
    }
  };

  const saveVideo = async (video) => {
    if (!currentUser) return alert('Set username first');

    // If already saved, unsave
    if (savedIds.has(video.id)) {
      try {
        setIsLoading(true);
        await axios.delete(`${API_BASE}/api/saved`, { data: { userId: currentUser.id, videoId: video.id } });
        setSavedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(video.id);
          return newSet;
        });
        setNotification('Video removed successfully!');
        setTimeout(() => setNotification(''), 2000);
        loadSavedVideos(currentUser.id);
      } catch (error) {
        console.error(error);
        alert('Error unsaving video');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Otherwise, save video
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE}/api/save`, {
        userId: currentUser.id,
        videoId: video.id,
        title: video.title,
        channel: video.channel,
        thumbnail: video.thumbnail,
      });
      setSavedIds((prev) => new Set(prev).add(video.id));
      setNotification('Video saved successfully!');
      setTimeout(() => setNotification(''), 2000);
      loadSavedVideos(currentUser.id);
    } catch (error) {
      console.error(error);
      alert('Error saving video');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedVideos = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/saved/${userId}`);
      setSavedVideos(response.data);
      const ids = new Set(response.data.map((v) => v.video_id));
      setSavedIds(ids);
    } catch (error) {
      console.error(error);
    }
  };

  const updateProgress = async (videoId, progress) => {
    try {
      await axios.put(`${API_BASE}/api/progress`, {
        userId: currentUser.id,
        videoId,
        progress: parseInt(progress),
      });
      loadSavedVideos(currentUser.id);
    } catch (error) {
      console.error(error);
    }
  };

  const removeVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to remove this video?')) return;
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE}/api/saved`, { data: { userId: currentUser.id, videoId } });
      setSavedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
      setNotification('Video removed successfully!');
      setTimeout(() => setNotification(''), 2000);
      loadSavedVideos(currentUser.id);
    } catch (error) {
      console.error(error);
      alert('Error removing video');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('codetube_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setUsername(user.username);
      loadSavedVideos(user.id);
      handleSearch('');
    }
  }, []);

  return (
    <div className="App">
      <Header
        currentUser={currentUser}
        username={username}
        setUsername={setUsername}
        handleSetUser={handleSetUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setCurrentUser={setCurrentUser}
        setSavedVideos={setSavedVideos}
        isLoading={isLoading}
      />

      {notification && (
  <div className="popup-card-wrapper">
    <div className={`popup-card ${notification.includes('removed') ? 'error' : 'success'}`}>
      <div className="popup-icon">
        {notification.includes('removed') ? '✖' : '✔'}
      </div>
      <div className="popup-message">{notification}</div>
    </div>
  </div>
)}





      {currentUser && (
        <div className="main-content">
          {isLoading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          )}

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
                <button onClick={() => handleSearch()} disabled={isLoading}>
                 Search <FaSearch />
                </button>
              </div>

              <div className="results">
                {searchResults.length === 0 ? (
                  <p className="no-results">No videos found.</p>
                ) : (
                  searchResults.map((video) => (
                    <div key={video.id} className="video-card">
                      <img src={video.thumbnail} alt={video.title} />
                      <div className="video-info">
                        <h3>{video.title}</h3>
                        <p className="channel">{video.channel}</p>
                        <button
                          className={`save-btn ${savedIds.has(video.id) ? 'saved' : ''}`}
                          onClick={() => saveVideo(video)}
                        >
                          <FaBookmark /> {savedIds.has(video.id) ? 'Saved' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="saved-videos">
              {savedVideos.length === 0 ? (
                <p className="no-saved">No saved videos yet. Search and save them to see here!</p>
              ) : (
                savedVideos.map((video) => (
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
      <Footer />
    </div>
  );
}

export default App;
