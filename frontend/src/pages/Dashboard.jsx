import React, { useState, useEffect } from 'react';
import { FaTrash, FaSave } from 'react-icons/fa';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';

const Dashboard = ({ currentUser, apiBase }) => {
  const effectiveApiBase = apiBase || process.env.REACT_APP_API_BASE || "http://localhost:3001";
  
  const [savedVideos, setSavedVideos] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [cinemaVideo, setCinemaVideo] = useState(null);
  const [videoStatuses, setVideoStatuses] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    const fetchSavedVideos = async () => {
      await loadSavedVideos(currentUser.id);
    };

    fetchSavedVideos();
  }, [currentUser]);

  const loadSavedVideos = async (userId) => {
    try {
      setIsLoading(true);
      if (!effectiveApiBase) throw new Error('API base URL is not defined');

      const response = await axios.get(`${effectiveApiBase}/api/saved/${userId}`);
      const videoData = response.data || [];
      
      const videosWithProgress = videoData.map((v) => {
        const progress = v.progress || 0;
        const status = progress >= 90 ? 'completed' : progress > 0 ? 'ongoing' : 'not-started';

        return {
          ...v,
          progress: Math.min(progress, 100),
          video_id: v.video_id || v.id,
          url: v.url || v.video_url,
          status,
        };
      });

      setSavedVideos(videosWithProgress);

      const initialStatuses = {};
      videosWithProgress.forEach((video) => {
        initialStatuses[video.video_id] = video.status;
      });
      setVideoStatuses(initialStatuses);

      const ids = new Set(videosWithProgress.map((v) => v.video_id));
      setSavedIds(ids);
    } catch (error) {
      console.error('Error loading saved videos:', error);
      setNotification('Failed to load saved videos. Please check your connection.');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const removeVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to remove this video?')) return;
    if (!effectiveApiBase) {
      console.error('API base URL is not defined');
      setNotification('Configuration error. Please refresh the page.');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    
    try {
      setIsLoading(true);
      await axios.delete(`${effectiveApiBase}/api/saved`, {
        data: { userId: currentUser.id, videoId },
      });
      setSavedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
      setNotification('Video removed successfully!');
      setTimeout(() => setNotification(''), 2000);
      loadSavedVideos(currentUser.id);
    } catch (error) {
      console.error('Error removing video:', error);
      setNotification('Error removing video. Please try again.');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (videoId, newStatus) => {
    setVideoStatuses((prev) => ({
      ...prev,
      [videoId]: newStatus,
    }));
  };

  const saveVideoStatus = async (videoId) => {
    if (!effectiveApiBase) {
      console.error('API base URL is not defined');
      setNotification('Configuration error. Please refresh the page.');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    
    try {
      const status = videoStatuses[videoId];
      let progress = 0;
      if (status === 'completed') progress = 100;
      else if (status === 'ongoing') progress = 50;

      await axios.put(`${effectiveApiBase}/api/progress`, {
        userId: currentUser.id,
        videoId,
        progress,
      });

      setSavedVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.video_id === videoId ? { ...video, status, progress } : video
        )
      );

      setNotification('Progress saved/updated successfully!');
      setTimeout(() => setNotification(''), 2000);
    } catch (error) {
      console.error('Error saving progress:', error);
      setNotification('Error saving progress. Please try again.');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  if (!currentUser) {
    return (
      <p className="not-logged-in">
        Please set a username first to view the dashboard.
      </p>
    );
  }

  return (
    <div className="dashboard-container">
      {notification && (
        <div className="popup-card-wrapper">
          <div className="popup-card success">
            <div className="popup-icon">✔</div>
            <div className="popup-message">{notification}</div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {cinemaVideo && (
        <VideoPlayer
          video={cinemaVideo}
          onClose={() => setCinemaVideo(null)}
          onSave={() => {}}
          isSaved={savedIds.has(cinemaVideo.id)}
        />
      )}

      <div className="saved-videos-section">
        <h2>Your Saved Videos ({savedVideos.length})</h2>
        <div className="video-list">
          {savedVideos.map((video) => (
            <div
              key={video.video_id}
              className="video-card"
              onClick={() =>
                setCinemaVideo({
                  ...video,
                  url:
                    video.url ||
                    video.video_url ||
                    `https://www.youtube.com/watch?v=${video.video_id}`,
                })
              }
            >
              <img src={video.thumbnail} alt={video.title} />
              <div className="video-info">
                <h3>{video.title}</h3>
                <p className="channel">{video.channel}</p>

                <div className="status-section">
                  <div className="dropdown-wrapper">
                    <select
                      className="status-dropdown force-down"
                      value={
                        videoStatuses[video.video_id] ||
                        video.status ||
                        'not-started'
                      }
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(video.video_id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      size="1"
                    >
                      <option value="not-started">Not Started</option>
                      <option value="ongoing">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="video-actions">
                    <button
                      className="save-status-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveVideoStatus(video.video_id);
                      }}
                      disabled={videoStatuses[video.video_id] === video.status}
                    >
                      <FaSave /> Save/Update
                    </button>
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVideo(video.video_id);
                      }}
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .dashboard-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
        .not-logged-in { text-align: center; padding: 40px; font-size: 18px; color: #666; }
        .loading { display: flex; flex-direction: column; align-items: center; padding: 40px; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #61dafb; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 10px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .saved-videos-section h2 { margin-bottom: 20px; color: #333; font-size: 24px; }
        .video-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .video-card { display: flex; flex-direction: column; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #fff; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .video-card:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
        .video-card img { width: 100%; height: 180px; object-fit: cover; }
        .video-info { padding: 15px; }
        .video-info h3 { margin: 0 0 8px 0; font-size: 16px; line-height: 1.4; color: #333; }
        .video-info .channel { margin: 0 0 15px 0; font-size: 14px; color: #666; }
        
        .status-section { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }
        .dropdown-wrapper { position: relative; }
        .status-dropdown { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; background-color: #f9f9f9; font-size: 14px; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D'12'%20height%3D'8'%20viewBox%3D'0%200%2012%208'%20fill%3D'none'%20xmlns%3D'http://www.w3.org/2000/svg'%3E%3Cpath%20d%3D'M1%201L6%206L11%201'%20stroke%3D'%23666'%20stroke-width%3D'2'%20stroke-linecap%3D'round'%20stroke-linejoin%3D'round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; background-size: 12px; }
        .status-dropdown:focus { outline: none; border-color: #61dafb; box-shadow: 0 0 0 2px rgba(97, 218, 251, 0.2); }
        .force-down option { direction: ltr; }
        .video-actions { display: flex; gap: 8px; }
        .save-status-btn { flex: 1; padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 14px; }
        .save-status-btn:hover:not(:disabled) { background: #218838; }
        .save-status-btn:disabled { background: #6c757d; cursor: not-allowed; opacity: 0.6; }
        .remove-btn { flex: 1; padding: 8px 12px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 14px; }
        .remove-btn:hover { background: #c82333; }
        .popup-card-wrapper { position: fixed; bottom: 20px; right: 20px; z-index: 999; }
        .popup-card { width: 250px; background: white; border-radius: 12px; padding: 20px; text-align: center; font-weight: bold; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .popup-card.success { border-bottom: 4px solid green; }
        .popup-card .popup-icon { font-size: 24px; color: white; background-color: green; width: 50px; height: 50px; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-bottom: 15px; }
        .popup-card .popup-message { font-size: 14px; color: #333; }
      `}</style>
    </div>
  );
};

export default Dashboard;
