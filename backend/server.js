const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./codetube.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');

    // Keep only users and saved_videos
    db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

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

// YouTube API key
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// Root route (added)
app.get('/', (req, res) => {
  res.send('CodeTube backend is running!');
});

// Register user
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  // Hash password
  bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hash],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Failed to create user' });
        }
        res.json({ id: this.lastID, username, email });
      }
    );
  });
});

// Login user
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Compare password
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) return res.status(500).json({ error: 'Error checking password' });
      if (!match) return res.status(401).json({ error: 'Invalid password' });

      res.json({ id: user.id, username: user.username, email: user.email });
    });
  });
});

// API Endpoint 1: Search
app.get('/api/search', async (req, res) => {
  try {
    let { q } = req.query;
    if (!q) q = '';

    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: 'snippet',
        maxResults: 20,
        q: `${q} programming coding tutorial`.trim(),
        type: 'video',
        key: YOUTUBE_API_KEY
      }
    });

    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.default.url,
      description: item.snippet.description
    }));

    res.json(videos);
  } catch (error) {
    console.error('YouTube API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch videos' });
  }
});

// API Endpoint 2: Get video details
app.get('/api/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: id,
        key: YOUTUBE_API_KEY
      }
    });

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
    console.error('YouTube API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch video details' });
  }
});

// API Endpoint 3: User management
app.post('/api/user', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (row) {
      res.json({ id: row.id, username: row.username });
    } else {
      db.run('INSERT INTO users (username) VALUES (?)', [username], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to create user' });
        res.json({ id: this.lastID, username });
      });
    }
  });
});

// API Endpoint 4: Save video
app.post('/api/save', (req, res) => {
  const { userId, videoId, title, channel, thumbnail } = req.body;

  if (!userId || !videoId) {
    return res.status(400).json({ error: 'User ID and Video ID are required' });
  }

  db.get(
    'SELECT * FROM saved_videos WHERE user_id = ? AND video_id = ?',
    [userId, videoId],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      if (row) {
        return res.status(409).json({ error: 'Video already saved' });
      }

      db.run(
        'INSERT INTO saved_videos (user_id, video_id, title, channel, thumbnail) VALUES (?, ?, ?, ?, ?)',
        [userId, videoId, title, channel, thumbnail],
        function(err) {
          if (err) return res.status(500).json({ error: 'Failed to save video' });
          res.json({ id: this.lastID, message: 'Video saved successfully', videoId });
        }
      );
    }
  );
});

// API Endpoint 5: Get saved videos
app.get('/api/saved/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    'SELECT * FROM saved_videos WHERE user_id = ? ORDER BY saved_at DESC',
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    }
  );
});

// API Endpoint 6: Update progress (accepts progress directly)
app.put('/api/progress', (req, res) => {
  const { userId, videoId, progress } = req.body;

  if (!userId || !videoId) {
    return res.status(400).json({ error: 'User ID and Video ID are required' });
  }

  db.run(
    'UPDATE saved_videos SET progress = ? WHERE user_id = ? AND video_id = ?',
    [progress, userId, videoId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Progress updated', progress });
    }
  );
});

// API Endpoint 7: Remove video
app.delete('/api/saved', (req, res) => {
  const { userId, videoId } = req.body;

  db.run(
    'DELETE FROM saved_videos WHERE user_id = ? AND video_id = ?',
    [userId, videoId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Video removed', changes: this.changes });
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
