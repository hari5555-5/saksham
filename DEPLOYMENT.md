# SAKSHAM Deployment Guide

## Architecture
- **Frontend**: React + TypeScript + Tailwind (deploy to Vercel)
- **Backend**: Node.js + Express (deploy to Render)
- **Database**: SQLite (file-based, auto-created on startup)

---

## Step 1: Push to GitHub

```bash
cd "c:\Users\JASHWINI .S A\OneDrive\Documents\saksham"
git init
git add .
git commit -m "Initial SAKSHAM commit"
# Create a GitHub repo at github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/saksham.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Render (Free)

1. Go to **https://render.com** and sign up/login
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `saksham-server`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Environment**: Node
   - **Plan**: Free
5. Add Environment Variables:
   - `JWT_SECRET` → (generate a strong random string)
   - `NODE_ENV` → `production`
   - `FRONTEND_URL` → (your Vercel URL, add after deploying frontend)
   - `OPENAI_API_KEY` → (optional, for real AI responses)
6. Click **Create Web Service**
7. Copy your Render URL (e.g., `https://saksham-server.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel (Free)

1. Go to **https://vercel.com** and sign up/login
2. Click **New Project → Import Git Repository**
3. Select your `saksham` repo
4. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL` → your Render backend URL
6. Click **Deploy**

---

## Step 4: Update CORS on Backend

After deploying to Vercel, go back to Render and update:
- `FRONTEND_URL` → your Vercel URL (e.g., `https://saksham.vercel.app`)

Then in `server/index.js`, the CORS config will automatically pick up the new URL.

---

## Step 5: Update Vite Proxy for Production

In `client/vite.config.ts`, the proxy only works in development.
For production, update `client/src/` API calls to use the full backend URL.

Add to `client/.env.production`:
```
VITE_API_URL=https://your-saksham-server.onrender.com
```

Then update `client/src/` axios base URL:
```ts
// Add to main.tsx before rendering:
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
```

---

## Local Development

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend  
cd client
npm run dev

# Open http://localhost:5173
```

---

## Environment Variables Reference

### Server (`server/.env`)
```
PORT=5000
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
OPENAI_API_KEY=sk-...  (optional)
FRONTEND_URL=http://localhost:5173
```

### Client (`client/.env.production`)
```
VITE_API_URL=https://your-render-url.onrender.com
```
