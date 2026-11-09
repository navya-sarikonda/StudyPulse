# StudyPulse 📚⚡

A modern, full-stack student task and productivity management application designed to help learners organize assignments, monitor deadlines, and elevate their study efficiency.

---

## 🌟 Key Features

- **Intuitive Task Management**: Create, edit, prioritize, and track academic assignments and daily tasks.
- **Progress Tracking & Analytics**: Visual dashboards to monitor completion rates and study consistency.
- **Responsive Modern UI**: Built with React, Vite, and custom sleek styling with smooth interactions.
- **RESTful API Backend**: Express & Node.js service handling authentication, task CRUD, and data persistence with MongoDB.
- **Cloud-Ready**: Preconfigured for deployment to Render (Backend) and Vercel (Frontend).

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Modern CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel (Frontend) & Render (Backend)

---

## 📂 Project Structure

```text
STUDYPULSE/
├── backend/               # Node.js Express API
│   ├── server.js          # Express app entry point
│   ├── package.json       # Backend dependencies & scripts
│   └── .env.example       # Example environment variables
├── frontend/              # React Vite SPA
│   ├── src/               # Application source code
│   ├── package.json       # Frontend dependencies & scripts
│   └── vite.config.js     # Vite build configuration
├── DEPLOYMENT.md          # Step-by-step production deployment guide
├── render.yaml            # Render Blueprint configuration
└── package.json           # Root workspace scripts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or MongoDB Atlas)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/navya-sarikonda/StudyPulse.git
   cd StudyPulse
   ```

2. **Install dependencies**:
   ```bash
   # Install root and workspace dependencies
   npm run backend:install
   npm run frontend:install
   ```

3. **Configure Environment Variables**:
   - In `backend/`, copy `.env.example` to `.env` and fill in your MongoDB URI and JWT Secret.
   - In `frontend/`, copy `.env.example` to `.env` and configure `VITE_API_URL` (defaults to `http://localhost:5000`).

4. **Start the Development Servers**:
   ```bash
   # Start backend (runs on http://localhost:5000)
   npm run backend:dev

   # In a separate terminal, start frontend (runs on http://localhost:5173)
   npm run frontend:dev
   ```

---

## 🚀 Deployment

For full deployment instructions to Render and Vercel, refer to [DEPLOYMENT.md](DEPLOYMENT.md).
