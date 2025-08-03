# 📺 PlayTube

A full-stack MERN application blending the core features of YouTube and Twitter (X) — built with a modular backend and JWT-authenticated REST API. Users can upload videos, tweet, comment, like, create playlists, and subscribe to channels.  
[Er diagram for Models Link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (access & refresh tokens)
- **File Uploads:** Multer + Cloudinary
- **Others:** Aggregation Pipelines, RESTful routing, Middleware pattern

## ✅ Features

### 📽 Video Module
- Upload video + thumbnail
- Get all videos with pagination
- Update/delete video
- Toggle publish status
- Get videos by user
- View single video by ID

### 🧵 Tweet Module
- Create tweet
- Update or delete tweet
- Get user's tweets

### 📁 Playlist Module
- Create a playlist
- Add/remove video to/from playlist
- Update/delete playlist
- Get user's playlists or by ID

### 💬 Comments
- Add, update, delete comment on a video
- Fetch comments for a video (paginated)

### ❤️ Likes
- Like/Unlike tweet, video, or comment
- Get all liked videos (aggregation)

### 👥 User Authentication
- Register/Login/Logout (JWT)
- Refresh token
- Change password
- Get/update user account details
- Upload avatar & cover image
- Watch history

### 🔔 Subscriptions
- Subscribe/unsubscribe to channels
- Get subscribed channels
- Get channel subscribers

## 📂 API Structure

Each module has its own route group:

| Module | Route Prefix |
|--------|-------------|
| Videos | `/api/v1/videos` |
| Tweets | `/api/v1/tweets` |
| Playlists | `/api/v1/playlists` |
| Comments | `/api/v1/comments` |
| Likes | `/api/v1/likes` |
| Users/Auth | `/api/v1/users` |
| Subscriptions | `/api/v1/subscriptions` |

🔐 Protected routes require a valid JWT in the Authorization header.

## 🚀 Getting Started

### 1. Clone the repo
```
git clone https://github.com/yourusername/playtube.git
cd playtube
```
### 2. Install dependencies

```
npm install
```
### 3. Create a .env file

```
PORT=5000
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```
### 4. Start the server

```
npm run dev
```

## 📦 Folder Structure

```
/controllers
/models
/routes
/middlewares
/utils
```

