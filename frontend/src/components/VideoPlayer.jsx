import React, { useRef, useEffect } from 'react';
import { FaBookmark, FaTimes } from 'react-icons/fa';

export default function VideoPlayer({ video, onClose, onSave, isSaved, onProgressUpdate }) {
  const iframeRef = useRef(null);

  // Handle video completion
  useEffect(() => {
    if (!video || !onProgressUpdate) return;

    const checkVideoCompletion = () => {
      // For YouTube embeds, we'll use a simple approach
      // Since we can't easily track progress in embedded iframes due to cross-origin restrictions,
      // we'll update progress to 100% when the user closes the player
      // This is a common limitation with embedded YouTube videos
    };

    // Set up interval to check video status (though limited due to cross-origin restrictions)
    const interval = setInterval(checkVideoCompletion, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [video, onProgressUpdate]);

  // When the player closes, check if we should mark as watched
  const handleClose = () => {
    // Since we can't accurately track YouTube video progress due to cross-origin restrictions,
    // we'll assume if the user opened the video, they watched at least some of it
    // For a better experience, you might want to implement a custom video player
    // or use a service that provides progress tracking APIs
    if (onProgressUpdate && video) {
      // Update to 100% when closed (as a simple solution)
      onProgressUpdate(video.id || video.video_id, 100, 100);
    }
    onClose();
  };

  if (!video) return null;

  // Determine video URL (supports YouTube embed)
  const getVideoEmbedUrl = (video) => {
    const url = video.url || '';
    let videoId = '';
    
    if (url.includes('youtube.com/watch')) {
      videoId = url.split('v=')[1];
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    } else if (video.id || video.video_id) {
      videoId = video.id || video.video_id;
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    
    return url;
  };

  return (
    <div className="player-overlay">
      <div className="player-container">
        <div className="player-header">
          <h2>{video.title}</h2>
          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>
        <iframe
          ref={iframeRef}
          title={video.title}
          src={getVideoEmbedUrl(video)}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="video-frame"
        />
        <div className="player-footer">
          <p className="channel">{video.channel}</p>
          <button
            className={`save-btn ${isSaved ? 'saved' : ''}`}
            onClick={() => onSave(video)}
          >
            <FaBookmark /> {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <style>{`
        .player-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .player-container {
          background: #fff;
          border-radius: 10px;
          width: 90%;
          max-width: 800px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .player-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background: #f5f5f5;
          border-bottom: 1px solid #ddd;
        }
        .player-header h2 {
          margin: 0;
          font-size: 16px;
        }
        .close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 18px;
        }
        .video-frame {
          width: 100%;
          height: 450px;
        }
        .player-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          border-top: 1px solid #ddd;
        }
        .channel {
          font-size: 14px;
          color: gray;
        }
        .save-btn {
          cursor: pointer;
          padding: 5px 10px;
          border-radius: 4px;
          border: none;
          background-color: #61dafb;
          color: white;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .save-btn.saved {
          background-color: #4caf50;
        }
      `}</style>
    </div>
  );
}