const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Initialize Express app - this creates our web server
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - these are plugins that add functionality to Express
app.use(cors()); // Allows frontend to communicate with backend
app.use(express.json()); // Lets server understand JSON data from requests

// Database setup - using SQLite for simplicity (no separate database server needed)
const db = new sqlite3.Database('./codetube.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    
    // Create tables if they don't exist
    // Users table stores basic user information
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Saved_videos table stores user's saved coding videos and progress
    db.run(`CREATE TABLE IF NOT EXISTS saved_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      video_id TEXT,
      title TEXT,
      channel TEXT,
      thumbnail TEXT,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      progress INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
  }
});

// YouTube API integration - we'll use this to search for coding videos
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// API Endpoint 1: Search for coding videos
// This lets our frontend search YouTube for coding tutorials
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query; // Get search query from URL parameters
    
    // Make request to YouTube API
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: 'snippet',
          maxResults: 20,
          q: `${q} programming coding tutorial`, // Always add coding-related terms
          type: 'video',
          key: YOUTUBE_API_KEY
        }
      }
    );
    
    // Format the response to only include data we need
    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.default.url,
      description: item.snippet.description
    }));
    
    // Send the formatted videos back to the frontend
    res.json(videos);
  } catch (error) {
    console.error('YouTube API error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// API Endpoint 2: Get video details
// This gets more information about a specific video
app.get('/api/video/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get video ID from URL
    
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          part: 'snippet,contentDetails',
          id: id,
          key: YOUTUBE_API_KEY
        }
      }
    );
    
    if (response.data.items.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const video = response.data.items[0];
    res.json({
      id: video.id,
      title: video.snippet.title,
      channel: video.snippet.channelTitle,
      thumbnail: video.snippet.thumbnails.medium.url,
      description: video.snippet.description,
      duration: video.contentDetails.duration
    });
  } catch (error) {
    console.error('YouTube API error:', error);
    res.status(500).json({ error: 'Failed to fetch video details' });
  }
});

// API Endpoint 3: User management
// Simple user system - just stores usernames for this demo
app.post('/api/user', (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  // Check if user already exists
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (row) {
      // User exists, return existing user info
      res.json({ id: row.id, username: row.username });
    } else {
      // Create new user
      db.run('INSERT INTO users (username) VALUES (?)', [username], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create user' });
        }
        res.json({ id: this.lastID, username });
      });
    }
  });
});

// API Endpoint 4: Save video to user's collection
app.post('/api/save', (req, res) => {
  const { userId, videoId, title, channel, thumbnail } = req.body;
  
  if (!userId || !videoId) {
    return res.status(400).json({ error: 'User ID and Video ID are required' });
  }
  
  // Check if video already saved to avoid duplicates
  db.get(
    'SELECT * FROM saved_videos WHERE user_id = ? AND video_id = ?', 
    [userId, videoId], 
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        return res.status(409).json({ error: 'Video already saved' });
      }
      
      // Save video to database
      db.run(
        'INSERT INTO saved_videos (user_id, video_id, title, channel, thumbnail) VALUES (?, ?, ?, ?, ?)',
        [userId, videoId, title, channel, thumbnail],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to save video' });
          }
          res.json({ 
            id: this.lastID, 
            message: 'Video saved successfully',
            videoId 
          });
        }
      );
    }
  );
});

// API Endpoint 5: Get user's saved videos
app.get('/api/saved/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(
    'SELECT * FROM saved_videos WHERE user_id = ? ORDER BY saved_at DESC',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// API Endpoint 6: Update video progress (0%, 25%, 50%, 75%, 100%)
app.put('/api/progress', (req, res) => {
  const { userId, videoId, progress } = req.body;
  
  db.run(
    'UPDATE saved_videos SET progress = ? WHERE user_id = ? AND video_id = ?',
    [progress, userId, videoId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Progress updated', changes: this.changes });
    }
  );
});

// API Endpoint 7: Remove saved video
app.delete('/api/saved', (req, res) => {
  const { userId, videoId } = req.body;
  
  db.run(
    'DELETE FROM saved_videos WHERE user_id = ? AND video_id = ?',
    [userId, videoId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Video removed', changes: this.changes });
    }
  );
});

// Health check endpoint - useful for testing if server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});