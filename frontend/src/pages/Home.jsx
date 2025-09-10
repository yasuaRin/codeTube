import React, { useState, useEffect, useCallback } from 'react';
import { FaBookmark, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';

export default function Home({ currentUser, apiBase: propApiBase }) {
  const apiBase = propApiBase || 'http://localhost:5000';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [notification, setNotification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cinemaVideo, setCinemaVideo] = useState(null);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const fetchAllVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiBase}/api/search?q=`);
      const shuffledVideos = shuffleArray(response.data);
      setSearchResults(shuffledVideos);
    } catch (error) {
      console.error(error);
      alert('Error fetching videos');
    } finally {
      setIsLoading(false);
    }
  }, [apiBase]);

  const loadSavedVideos = useCallback(async (userId) => {
    try {
      const response = await axios.get(`${apiBase}/api/saved/${userId}`);
      const ids = new Set(response.data.map((v) => v.video_id));
      setSavedIds(ids);
    } catch (err) { console.error(err); }
  }, [apiBase]);

  useEffect(() => {
    setCinemaVideo(null);
    if (currentUser) loadSavedVideos(currentUser.id);
    fetchAllVideos();
  }, [currentUser, fetchAllVideos, loadSavedVideos]);

  const handleSearch = async (query = searchQuery) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiBase}/api/search?q=${encodeURIComponent(query)}`);
      const shuffledResults = shuffleArray(response.data);
      setSearchResults(shuffledResults);
    } catch (error) {
      console.error(error);
      alert('Error searching videos');
    } finally {
      setIsLoading(false);
    }
  };

  const saveVideo = async (video) => {
    if (!currentUser) return alert('Set username first');
    if (savedIds.has(video.id)) {
      try {
        await axios.delete(`${apiBase}/api/saved`, { data: { userId: currentUser.id, videoId: video.id } });
        setSavedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(video.id);
          return newSet;
        });
        setNotification('Video removed successfully!');
        setTimeout(() => setNotification(''), 2000);
        loadSavedVideos(currentUser.id);
      } catch (err) { console.error(err); }
      return;
    }
    try {
      await axios.post(`${apiBase}/api/save`, {
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
    } catch (err) { console.error(err); }
  };

  return (
    <div className="home">
      {/* Search bar below header */}
      <div className="search-container">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <input
            type="text"
            placeholder="Search for coding tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <FaSearch style={{ marginRight: '5px' }} /> Search
          </button>
        </form>
      </div>

      <div className="results">
        {isLoading ? <p>Loading...</p> :
          searchResults.length === 0 ? (
            <p>No videos found.</p>
          ) : (
            searchResults.map((video) => (
              <div
                key={video.id}
                className="video-card"
                onClick={() => setCinemaVideo({
                  ...video,
                  url: video.url || video.video_url || `https://www.youtube.com/watch?v=${video.id}`
                })}
              >
                <img src={video.thumbnail} alt={video.title} />
                <div className="video-info">
                  <h3>{video.title}</h3>
                  <p className="channel">{video.channel}</p>
                  <button
                    className={`save-btn ${savedIds.has(video.id) ? 'saved' : ''}`}
                    onClick={(e) => { e.stopPropagation(); saveVideo(video); }}
                  >
                    <FaBookmark /> {savedIds.has(video.id) ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            ))
          )}
      </div>

      {notification && (
        <div className="popup-card-wrapper">
          <div className={`popup-card ${notification.includes('removed') ? 'error' : 'success'}`}>
            <div className="popup-icon">{notification.includes('removed') ? '✖' : '✔'}</div>
            <div className="popup-message">{notification}</div>
          </div>
        </div>
      )}

      {cinemaVideo && (
        <VideoPlayer
          video={cinemaVideo}
          onClose={() => setCinemaVideo(null)}
          onSave={saveVideo}
          isSaved={savedIds.has(cinemaVideo.id)}
        />
      )}

      <style>{`
        .home { padding: 20px; max-width: 1200px; margin: 0 auto; }

        .search-container {
          width: 100%;
          max-width: 500px;
          margin: 20px auto;
        }
        .search-container form {
          display: flex;
          gap: 10px;
        }
        .search-container input {
          flex: 1;
          padding: 12px 15px;
          font-size: 16px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        .search-container button {
          padding: 12px 20px;
          font-size: 16px;
          border-radius: 6px;
          border: none;
          background-color: #61dafb;
          color: #fff;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .search-container button:hover { background-color: #21a1f1; }

        .results { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
        .video-card { display: flex; flex-direction: column; border: 1px solid #ccc; border-radius: 8px; overflow: hidden; cursor: pointer; transition: transform 0.2s; background: #fff; }
        .video-card:hover { transform: translateY(-5px); }
        .video-card img { width: 100%; height: 180px; object-fit: cover; }
        .video-info { padding: 10px; text-align: left; }
        .video-info h3 { margin: 0 0 5px 0; font-size: 16px; line-height: 1.4; height: 44px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .video-info .channel { font-size: 14px; color: gray; }
        .save-btn { cursor: pointer; padding: 5px 10px; margin-top: 5px; border-radius: 4px; border: none; }
        .save-btn.saved { background-color: #61dafb; color: white; }

        .popup-card-wrapper { position: fixed; bottom: 20px; right: 20px; z-index: 999; }
        .popup-card { width: 90%; max-width: 250px; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center; font-weight: bold; display: flex; flex-direction: column; align-items: center; }
        .popup-card.success { border-bottom: 4px solid green; }
        .popup-card.error { border-bottom: 4px solid red; }
        .popup-card .popup-icon { font-size: 24px; color: white; background-color: ${notification && notification.includes('removed') ? 'red' : 'green'}; width: 50px; height: 50px; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-bottom: 15px; }
        .popup-card .popup-message { font-size: 14px; color: #333; }
      `}</style>
    </div>
  );
}
