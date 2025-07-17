#!/bin/bash

echo "🚀 ResumePro Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/your-repo.git"
    exit 1
fi

echo "✅ Git repository found"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy to production - $(date)"
git push origin main

echo "✅ Code pushed to GitHub"
echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://render.com"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New +' → 'Blueprint'"
echo "4. Connect your repository"
echo "5. Click 'Apply' to deploy"
echo ""
echo "📋 Required Environment Variables:"
echo "Backend:"
echo "  - DB_HOST"
echo "  - DB_USER" 
echo "  - DB_PASSWORD"
echo "  - DB_NAME"
echo "  - JWT_SECRET"
echo "  - GROQ_API_KEY"
echo "  - FRONTEND_URL"
echo ""
echo "Frontend:"
echo "  - REACT_APP_API_URL"
echo ""
echo "🌐 Your app will be available at:"
echo "  Frontend: https://your-app-name.onrender.com"
echo "  Backend:  https://your-backend-name.onrender.com"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md" 