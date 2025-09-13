# SafeRental Deployment Guide

## Deploy to Render (Free Tier)

### Prerequisites
- GitHub account
- Render account (free)
- Required environment variables (see below)

### Step 1: Push to GitHub

1. **Create a new repository on GitHub** (don't initialize with README, .gitignore, or license)

2. **Initialize git and push your code:**
```bash
git init
git add .
git commit -m "Initial commit: SafeRental application"
git branch -M main
git remote add origin https://github.com/Mayanshh/your-repo-name.git
git push -u origin main
```

### Step 2: Deploy on Render

1. **Go to Render.com** and connect your GitHub account

2. **Create a new Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Choose your SafeRental repository

3. **Configure the service:**
   - **Name:** `saferental-app`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** SafeRental
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

4. **Environment Variables:**
   Add these in Render's Environment Variables section:
   
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   SENDGRID_API_KEY=your_sendgrid_api_key
   SESSION_SECRET=your_random_session_secret
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   FROM_EMAIL=noreply@yourdomain.com
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete

### Step 3: Configure Custom Domain (Optional)

1. In Render dashboard, go to your service settings
2. Add your custom domain
3. Configure DNS records as instructed by Render

## Build Commands Summary

```bash
# Development
npm run dev

# Production Build
npm run build

# Production Start
npm start

# Type Check
npm run check
```

## File Structure for Production

```
SafeRental/
├── client/           # React frontend source
├── server/          # Express backend source
├── shared/          # Shared types and schemas
├── dist/            # Built files (generated)
├── uploads/         # File upload directory
├── package.json     # Dependencies and scripts
└── .gitignore      # Git ignore rules
```

## Important Notes

1. **MongoDB Atlas:** Make sure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) for Render deployment
2. **Firebase Console:** Configure your Firebase project to allow your Render domain
3. **SendGrid:** Verify your sender email in SendGrid console
4. **HTTPS:** Render provides free SSL certificates automatically
5. **Environment Variables:** Never commit secrets to git - always use environment variables

## Troubleshooting

### Build Failures
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs in Render dashboard

### Runtime Errors
- Verify all environment variables are set correctly
- Check application logs in Render dashboard
- Ensure database connections are properly configured

### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0)
- Test connection string locally first

## Support

For support, contact the developer:
- Email: mayanshbangali49@gmail.com
- GitHub: @Mayanshh
- LinkedIn: Mayansh Bangali