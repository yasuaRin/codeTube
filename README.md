## 1. Project Overview
codeTube is a mini version of Youtube which specifically designed for coding tutorials. It allows users (students) to search for programming related videos, save them to a personal collection, and track their learning progress, which covers all of the MVP. Built as a full stack application in a short period of time, it demonstrates integration with external APIs and proper application architecture. 

## 2. Key Features
- **Search Coding Content**: Find programming tutorials across all languages and frameworks  
- **Save Favorite Videos**: Build a personal library of learning resources  
- **Track Learning Progress**: Mark videos as not started, in progress, or completed  
- **User Accounts**: Simple registration and authentication system  
- **Clean Interface**: Intuitive design focused on the learning experience  

## 3. Technology Stack
- **Frontend**: React with modern hooks and functional components  
- **Backend**: Node.js with Express.js framework  
- **Database**: SQLite for data persistence  
- **External API**: YouTube Data API v3 for content access  
- **Authentication**: bcrypt for password hashing and security  
- **Deployment**: Railway (backend + frontend)  

## 4. Technology Choices & Justification
**Frontend: React with Hooks**  
- Chosen for component reusability, efficient state management, and hot reloading during development.  
- Alternative considered: Vue.js (lighter but less familiar for the team), Angular (more structured but heavier for MVP).  

**Backend: Node.js + Express**  
- Selected for consistency in using JavaScript across frontend and backend.  
- Express provides a lightweight, flexible middleware system.  
- Alternative considered: Python with Flask/Django (great for APIs but slower integration with React).  

**Database: SQLite**  
- Lightweight, file-based DB – perfect for MVP and local development.  
- Requires zero configuration and is easy to deploy with Railway.  
- Alternative considered: PostgreSQL (better for scaling, planned for future improvements).  

**External API: YouTube Data API v3**  
- Offers a vast library of free educational content.  
- Well-documented and reliable for coding-related searches.  

**Deployment: Railway**  
- One-click deployment and environment variable support.  
- Simple to host both frontend and backend together.  
- Alternatives: Vercel (great for frontend but backend support limited), Render (similar but slower startup).  

**Authentication: bcrypt password hashing**  
- Provides basic security for stored user credentials.  
- Alternatives considered: JWT-based authentication (planned for future to enable session-based login).  

## 5. Project Setup Instructions

### 5.1 Prerequisites
- Node.js (version 14 or higher)  
- npm or yarn package manager  
- YouTube Data API v3 key ([Get one here](https://console.cloud.google.com/))  
- Git for version control  

### 5.2 Installation Steps  

#### 5.2.1 Clone the Repository
```bash
git clone https://github.com/yasuaRin/codeTube.git
cd codetube
```

#### 5.2.2 Backend Setup
```bash
cd backend
npm install
echo "YOUTUBE_API_KEY=your_youtube_api_key_here" > .env
echo "PORT=5000" >> .env
npm start
```

#### 5.2.3 Frontend Setup
```bash
cd frontend
npm install
npm start
```

#### 5.2.4 Database Initialization
SQLite DB will be automatically created on backend start. Tables (`users`, `saved_videos`) are created if not present.  

### 5.3 Environment Variables
#### Backend `.env`
```
YOUTUBE_API_KEY=your_youtube_api_key_here
PORT=5000
```
#### Frontend `.env`
```
REACT_APP_API_BASE=http://localhost:5000
```

### 5.4 Running the Application
- Backend: `cd backend && npm start` → http://localhost:5000  
- Frontend: `cd frontend && npm start` → http://localhost:3000  

### 5.5 Testing
- Create an Account: Register with username, email, and password
- Search for Videos: Try searching for "JavaScript tutorial" or "Python basics"
- Save Videos: Click "Save Video" on any search result
- Track Progress: View saved videos and update your learning progress
- Manage Collection: Remove videos you no longer need

### 5.6 Troubleshooting
- Port in use → change PORT in `.env`  
- CORS errors → backend must run before frontend  
- API errors → check YouTube API key validity  
- DB issues → delete `codetube.db` and restart backend  


## 6. API Documentation
Base URL: `https://codetube-production.up.railway.app`  

- `POST /api/register` - Create new user account  
- `POST /api/login` - Authenticate user  
- `GET /api/search?q=query` - Search for coding videos  
- `POST /api/save` - Save video to user's collection  
- `GET /api/saved/:userId` - Get user's saved videos  
- `PUT /api/progress` - Update video progress  
- `DELETE /api/saved` - Remove saved video  

## 7. API Design Philosophy
- **RESTful Endpoints**: Chosen for simplicity, predictability, and wide client compatibility.  
- **Consistency**: All endpoints follow clear resource-based patterns (`/api/register`, `/api/login`, `/api/saved`).  
- **Error Handling**: Consistent JSON error responses for easier debugging.  
- **Authentication**: Basic auth with bcrypt for MVP, with plans to migrate to JWT for scalability.  
- **Extensibility**: Designed so more resources (e.g., courses, playlists) can be added easily.  

## 8. Integration Strategy
**API Selection**: YouTube Data API chosen for free, broad, and reliable coding content. 

**Error Handling**:  
- API errors (quota exceeded or invalid key) 
- If YouTube API is down, fallback to cached results from SQLite for previously searched videos.  

**API Key Security**:  
- Keys stored in `.env` files (not in codebase).  
- Keys restricted in Google Cloud Console to prevent misuse.  

**Rate Limiting**:  
- Quota monitored to avoid hitting YouTube daily request limits.  
- Plan to add caching layer and local DB indexing for repeat searches.  

## 9. Architecture Overview
**System Architecture**: Follows client-server model (React frontend + Express backend).  
**System Flow**:  
1. User interacts with React UI.  
2. React → Express API → YouTube API or SQLite DB.  
3. Backend responds with JSON → React updates state/UI.  

**Key Design Decisions**:  
- RESTful endpoints  
- Component-based React UI  
- SQLite for MVP simplicity  
- `.env`-based config for portability  

## 10. Critical Analysis
**What Works Well**  
- Clear separation of frontend/backend  
- Easy-to-use interface with progress tracking  
- RESTful API design for simplicity  
- Error handling in place for YouTube API  

**Limitations**  
- Basic authentication only (bcrypt, no JWT/OAuth)  
- SQLite not scalable for large datasets  
- No advanced filters in search  
- API quota limits could block heavy users  

**Next Improvements**  
- Switch to JWT authentication  
- Migrate DB to PostgreSQL  
- Add advanced search (difficulty, duration)  
- Add social features + analytics  

**Scalability Considerations**  
- Move to PostgreSQL for multi-user scale  
- Use CDN for faster content delivery  
- Add load balancing  
- Implement API rate limiting  

## 11. Deployment URLs
- **Frontend**: `https://codetube-production-1481.up.railway.app/`  
- **Backend**: `https://codetube-production.up.railway.app/`  
