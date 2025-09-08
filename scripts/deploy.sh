#!/bin/bash

# Aletheia Deployment Script
# This script helps with deploying the application to production

set -e

echo "🚀 Aletheia Deployment Script"
echo "============================="
echo ""

# Check if running from project root
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to deploy frontend to Vercel
deploy_frontend() {
    echo "📦 Deploying Frontend to Vercel..."
    echo "-----------------------------------"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo "🔧 Building frontend for production..."
    cd frontend
    npm ci
    npm run build
    
    echo "🚀 Deploying to Vercel..."
    echo "Please follow the prompts to complete deployment:"
    vercel --prod
    
    cd ..
    echo "✅ Frontend deployment initiated!"
}

# Function to prepare backend for deployment
prepare_backend() {
    echo "📦 Preparing Backend for Deployment..."
    echo "--------------------------------------"
    
    cd backend
    
    echo "🔧 Building backend..."
    npm ci
    npm run build
    
    echo "✅ Backend is ready for deployment!"
    echo ""
    echo "📝 Next steps for backend deployment:"
    echo "1. Go to https://railway.app or https://render.com"
    echo "2. Connect your GitHub repository"
    echo "3. Deploy the backend directory"
    echo "4. Set the following environment variables:"
    echo "   - NODE_ENV=production"
    echo "   - PORT=3001"
    echo "   - JWT_SECRET=<your-secret>"
    echo "   - FRONTEND_URL=<your-vercel-url>"
    
    cd ..
}

# Function to run pre-deployment checks
pre_deploy_checks() {
    echo "🔍 Running Pre-deployment Checks..."
    echo "------------------------------------"
    
    # Check Node version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        echo "❌ Node.js version 20 or higher is required"
        exit 1
    fi
    echo "✅ Node.js version check passed"
    
    # Run tests
    echo "🧪 Running backend tests..."
    cd backend
    npm test || { echo "❌ Backend tests failed"; exit 1; }
    cd ..
    echo "✅ All tests passed"
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        echo "⚠️  Warning: You have uncommitted changes"
        read -p "Do you want to continue? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    echo "✅ Pre-deployment checks completed!"
}

# Main menu
show_menu() {
    echo "Please select an option:"
    echo "1) Deploy Frontend to Vercel"
    echo "2) Prepare Backend for Deployment"
    echo "3) Full Deployment (Frontend + Backend prep)"
    echo "4) Run Pre-deployment Checks Only"
    echo "5) Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            pre_deploy_checks
            deploy_frontend
            ;;
        2)
            pre_deploy_checks
            prepare_backend
            ;;
        3)
            pre_deploy_checks
            deploy_frontend
            prepare_backend
            ;;
        4)
            pre_deploy_checks
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid option. Please try again."
            show_menu
            ;;
    esac
}

# Run the script
show_menu

echo ""
echo "🎉 Deployment script completed!"
echo "================================"
echo ""
echo "📚 Documentation:"
echo "- Deployment Guide: ./DEPLOYMENT.md"
echo "- Frontend URL: Check Vercel dashboard"
echo "- Backend URL: Check Railway/Render dashboard"