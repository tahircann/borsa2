#!/bin/bash

# BORSAsite Production Deployment Script
# Server: 145.223.80.133
# User: root
# Password: 214721472147Me.

echo "🚀 Starting BORSAsite Production Deployment..."

# Configuration
SERVER_IP="145.223.80.133"
SERVER_USER="root"
SERVER_PATH="/var/www/borsasite"
LOCAL_PATH="/Users/hammeyva/Desktop/yedek projeler/BORSAsite"

echo "📦 Building the application..."
cd "$LOCAL_PATH"

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the build errors before deployment."
    exit 1
fi

echo "✅ Build completed successfully!"

# Create production files list
echo "📝 Preparing files for deployment..."
echo "Files to deploy:"
echo "- package.json"
echo "- package-lock.json" 
echo "- next.config.js"
echo "- .next/"
echo "- public/"
echo "- api-backend/"
echo "- cache/"
echo "- components/"
echo "- pages/"
echo "- services/"
echo "- styles/"
echo "- utils/"
echo "- .env.production"

echo "🌐 Ready to deploy to production server: $SERVER_IP"
echo "👤 Username: $SERVER_USER"
echo "📁 Deployment path: $SERVER_PATH"

echo ""
echo "⚠️  MANUAL DEPLOYMENT STEPS:"
echo "1. Copy all project files to the server using scp or rsync"
echo "2. SSH into the server: ssh $SERVER_USER@$SERVER_IP"
echo "3. Navigate to the project directory: cd $SERVER_PATH"
echo "4. Install dependencies: npm install --production"
echo "5. Set environment to production: export NODE_ENV=production"
echo "6. Start the application: npm start"
echo "7. Set up PM2 for process management: pm2 start npm --name 'borsasite' -- start"
echo "8. Configure nginx proxy to serve the application"

echo ""
echo "🔧 Example rsync command:"
echo "rsync -avz --exclude node_modules --exclude .git '$LOCAL_PATH/' $SERVER_USER@$SERVER_IP:$SERVER_PATH/"

echo ""
echo "🔥 Example server setup commands:"
echo "# Install Node.js and PM2"
echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
echo "apt-get install -y nodejs"
echo "npm install -g pm2"
echo ""
echo "# Install and configure nginx"
echo "apt-get update && apt-get install -y nginx"
echo ""
echo "# Start the application"
echo "cd $SERVER_PATH"
echo "npm install --production"
echo "npm run build"
echo "pm2 start npm --name 'borsasite' -- start"
echo "pm2 save"
echo "pm2 startup"

echo ""
echo "✨ Deployment preparation complete!"
echo "📋 Next steps: Follow the manual deployment steps above to complete the production deployment."
