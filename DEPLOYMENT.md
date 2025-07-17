# 🚀 ResumePro Deployment Guide

## Quick Deploy Options

### Option 1: Render.com (Recommended - Free)
1. **Sign up** at [render.com](https://render.com)
2. **Connect your GitHub** repository
3. **Deploy using render.yaml** (already configured)
4. **Set environment variables** in Render dashboard

### Option 2: Railway.app (Free tier)
1. **Sign up** at [railway.app](https://railway.app)
2. **Connect GitHub** repository
3. **Deploy backend** and **frontend** separately
4. **Configure environment variables**

### Option 3: Vercel + Railway (Free)
1. **Deploy frontend** on [vercel.com](https://vercel.com)
2. **Deploy backend** on [railway.app](https://railway.app)
3. **Connect them** via environment variables

## 🛠️ Pre-Deployment Checklist

### 1. Environment Variables Setup
Create `.env` files for both frontend and backend:

**Backend (.env)**
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env)**
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

### 2. Database Setup
- **Option A**: Use a cloud database (PlanetScale, Railway, Render)
- **Option B**: Use a local database with port forwarding
- **Option C**: Use SQLite for simplicity

### 3. File Upload Configuration
Update `backend/index.js` to handle file uploads in production:
```javascript
// Add this to your backend
app.use('/uploads', express.static('uploads'));
```

## 📋 Step-by-Step Deployment (Render.com)

### Step 1: Prepare Your Repository
1. **Push all changes** to GitHub
2. **Ensure render.yaml** is in your root directory
3. **Check all environment variables** are documented

### Step 2: Deploy on Render
1. **Go to [render.com](https://render.com)**
2. **Click "New +" → "Blueprint"**
3. **Connect your GitHub repository**
4. **Render will automatically detect render.yaml**
5. **Click "Apply"**

### Step 3: Configure Environment Variables
In Render dashboard, set these variables:

**Backend Service:**
- `DB_HOST` - Your database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - Random secret string
- `GROQ_API_KEY` - Your Groq API key
- `FRONTEND_URL` - Your frontend URL

**Frontend Service:**
- `REACT_APP_API_URL` - Your backend URL

### Step 4: Database Setup
1. **Create a new database** (MySQL/PostgreSQL)
2. **Run your database migrations**
3. **Update environment variables** with database credentials

### Step 5: Test Your Deployment
1. **Check backend health**: `https://your-backend.onrender.com/api/test`
2. **Test frontend**: `https://your-frontend.onrender.com`
3. **Test authentication flow**
4. **Test file uploads**
5. **Test AI features**

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Update CORS configuration in `backend/index.js`
   - Add your frontend URL to allowed origins

2. **Database Connection Issues**
   - Check database credentials
   - Ensure database is accessible from deployment platform

3. **File Upload Issues**
   - Check file permissions
   - Ensure upload directory exists
   - Consider using cloud storage (AWS S3, Cloudinary)

4. **Environment Variables**
   - Double-check all variables are set
   - Ensure no typos in variable names

### Performance Optimization:
1. **Enable compression** in Express
2. **Add caching headers**
3. **Optimize images** and static assets
4. **Use CDN** for static files

## 🌐 Custom Domain Setup

### Option 1: Render Custom Domain
1. **Go to your service** in Render dashboard
2. **Click "Settings" → "Custom Domain"**
3. **Add your domain**
4. **Update DNS records**

### Option 2: Cloudflare
1. **Sign up** for Cloudflare
2. **Add your domain**
3. **Update nameservers**
4. **Create CNAME records**

## 📊 Monitoring & Analytics

### Recommended Tools:
1. **Uptime Robot** - Monitor uptime
2. **Google Analytics** - Track user behavior
3. **Sentry** - Error tracking
4. **LogRocket** - Session replay

## 🔒 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] SQL injection protection
- [ ] XSS protection enabled

## 📞 Support

If you encounter issues:
1. **Check Render logs** in dashboard
2. **Review environment variables**
3. **Test locally** first
4. **Check GitHub issues** for similar problems

---

**Happy Deploying! 🎉** 