#!/bin/bash

# Smart-Pay Quick Deployment Script for Ubuntu/Debian VPS
# Run as: chmod +x deploy.sh && ./deploy.sh

set -e

echo "======================================"
echo "Smart-Pay VPS Deployment Script"
echo "======================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo "This script must be run as root"
   exit 1
fi

echo ""
echo "[1/5] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
apt-get install -y nodejs > /dev/null 2>&1
node --version
npm --version

echo ""
echo "[2/5] Installing PM2 globally..."
npm install -g pm2 > /dev/null 2>&1
pm2 --version

echo ""
echo "[3/5] Installing backend dependencies..."
cd backend
npm install

echo ""
echo "[4/5] Creating .env file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ .env created from .env.example"
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env with your actual MongoDB URI"
    echo "   Run: nano backend/.env"
else
    echo "✓ .env already exists"
fi

echo ""
echo "[5/5] Starting application with PM2..."
pm2 start server.js --name "smart-pay-backend"
pm2 startup
pm2 save

echo ""
echo "======================================"
echo "✓ Deployment Complete!"
echo "======================================"
echo ""
echo "Dashboard URL: http://157.173.101.159:9205"
echo ""
echo "Useful commands:"
echo "  pm2 status              # Check service status"
echo "  pm2 logs smart-pay-backend  # View logs"
echo "  pm2 restart smart-pay-backend  # Restart service"
echo ""
