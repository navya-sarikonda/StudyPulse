# StudyPulse Deployment Guide (Render + Vercel)

This project is configured to deploy as two decoupled services:
- **Backend (API)**: Hosted on [Render](https://render.com) (Free Node.js Web Service)
- **Frontend (UI)**: Hosted on [Vercel](https://vercel.com) (Free Fast CDN / Edge Network)

---

## Part 1: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in (using GitHub or Google).
2. Click **New +** > **Web Service**.
3. Choose your Git repository (or connect your GitHub repository `STUDYPULSE`).
4. Configure the Web Service settings:
   - **Name**: `studypulse-backend` (or your preferred name)
   - **Region**: Choose the closest region (e.g. Frankfurt, Singapore, Oregon)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. Under **Environment Variables**, add the following:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | `mongodb+srv://241fa04a83_db_user:NavyaGowtham17@cluster0.h8zmijn.mongodb.net/studypulse?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `studypulse_secure_login_2026_navya_8392` |
6. Click **Create Web Service**.
7. Once deployed, Render will provide a public URL (e.g., `https://studypulse-backend.onrender.com`).
   - Test it by visiting `https://your-backend.onrender.com/health` — it should return `{"status":"ok", ...}`.
   - **Copy this backend URL** for Part 2!

> [!NOTE]
> Render Free Tier services spin down after 15 minutes of inactivity and take 30–50 seconds to wake up on the first request. The added health check route (`/health`) helps monitor wake-up status.

---

## Part 2: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/) and sign in.
2. Click **Add New...** > **Project**.
3. Import your `STUDYPULSE` repository.
4. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`.
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
5. Expand the **Environment Variables** section and add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | Your Render URL from Part 1 (e.g. `https://studypulse-backend.onrender.com`) |
   *(Do NOT include a trailing slash in the URL)*
6. Click **Deploy**.
7. In ~30 seconds, Vercel will assign a production URL (e.g., `https://studypulse.vercel.app`).

---

## Part 3: Verify the Full Stack Deployment

1. Open your Vercel URL in your browser.
2. Click **Create an account** (Sign Up) and test creating a new student account.
3. Log in with the new credentials.
4. Add a task with a deadline.
5. Mark the task as completed, and verify it updates in the dashboard.
6. Refresh the page to confirm persistent data in MongoDB Atlas.
