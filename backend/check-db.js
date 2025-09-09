const sqlite3 = require('sqlite3').verbose();

// Open the database
const db = new sqlite3.Database('./codetube.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to database successfully!\n');
});

// Check users table
console.log('=== USERS TABLE ===');
db.all('SELECT * FROM users', (err, rows) => {
  if (err) {
    console.error('Error reading users:', err);
  } else {
    console.log(rows);
  }

  // Check saved_videos table
  console.log('\n=== SAVED VIDEOS TABLE ===');
  db.all('SELECT * FROM saved_videos', (err, videoRows) => {
    if (err) {
      console.error('Error reading videos:', err);
    } else {
      console.log(videoRows);
    }
    
    // Close the database connection
    db.close();
  });
});