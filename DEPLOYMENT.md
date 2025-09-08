# Aletheia Deployment Guide

This guide provides step-by-step instructions for deploying the Aletheia application to production.

## Overview

The Aletheia application consists of two parts:
- **Frontend**: Next.js application (deploy to Vercel)
- **Backend**: Express.js API server (deploy to Railway, Render, or similar)

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Railway account (or alternative like Render/Heroku)

## Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up/login with GitHub

2. **Deploy Backend**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select the `aletheia` repository
   - Railway will auto-detect the backend and create a deployment

3. **Configure Environment Variables**
   - In Railway dashboard, go to your project
   - Add these environment variables:
     ```
     NODE_ENV=production
     PORT=3001
     JWT_SECRET=your-strong-jwt-secret-here
     FRONTEND_URL=https://your-vercel-app.vercel.app
     ```

4. **Get Backend URL**
   - After deployment, Railway will provide a URL like: `https://aletheia-backend.railway.app`
   - Note this URL for the frontend configuration

## Step 2: Deploy Frontend to Vercel

### Option A: Using Vercel Web Dashboard (Recommended)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub

2. **Import Project**
   - Click "New Project"
   - Select the `aletheia` repository from GitHub
   - Choose "Continue" to import

3. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm ci`

4. **Set Environment Variables**
   - In project settings, add:
     ```
     NEXT_PUBLIC_API_BASE_URL=https://your-railway-backend-url
     NEXT_PUBLIC_WS_URL=wss://your-railway-backend-url
     ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option B: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Frontend Directory**
   ```bash
   cd frontend
   vercel --prod
   ```

## Step 3: Update Backend CORS Configuration

After both deployments:

1. Update the backend's CORS configuration to allow your Vercel domain
2. In `backend/src/index.ts`, update the CORS origin:
   ```typescript
   app.use(cors({
     origin: [
       'http://localhost:3002',
       'https://your-vercel-app.vercel.app'
     ]
   }));
   ```

## Step 4: Test Deployment

1. **Visit your Vercel URL**
   - Your application should load
   - Check browser console for any API errors

2. **Test Core Features**
   - Wallet connection
   - Navigation between views
   - API data loading

## Alternative Deployment Options

### Backend Alternatives to Railway
- **Render**: Free tier, similar to Railway
- **Heroku**: More established, has free tier with limitations
- **DigitalOcean App Platform**: Good performance, minimal free tier
- **Fly.io**: Modern deployment platform

### Frontend Alternatives to Vercel
- **Netlify**: Similar to Vercel, good Next.js support
- **AWS Amplify**: AWS-based hosting
- **GitHub Pages**: Free but limited (static only)

## Configuration Files

The repository includes these deployment configuration files:

- `vercel.json` - Vercel deployment configuration
- `backend/Dockerfile` - Docker configuration for backend
- `frontend/.env.production` - Production environment variables
- `backend/.env.example` - Backend environment template

## Troubleshooting

### Build Errors
- Check that all dependencies are properly listed in `package.json`
- Ensure TypeScript configuration is correct
- Verify environment variables are set

### CORS Errors
- Update backend CORS configuration with frontend URL
- Check that API URLs in frontend match backend deployment URL

### 404 Errors
- Verify Vercel configuration points to correct directories
- Check that all routes are properly configured

## Production Considerations

1. **Security**
   - Use strong JWT secrets
   - Configure proper CORS origins
   - Enable HTTPS in production

2. **Performance**
   - Enable Next.js production optimizations
   - Configure proper caching headers
   - Monitor application performance

3. **Monitoring**
   - Set up error tracking (Sentry, LogRocket, etc.)
   - Monitor API performance
   - Set up uptime monitoring

## Support

For deployment issues:
1. Check the deployment logs in Railway/Vercel dashboards
2. Verify all environment variables are correctly set
3. Test API endpoints directly before testing frontend integration

---

**Live Application URLs** (update after deployment):
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.railway.app`