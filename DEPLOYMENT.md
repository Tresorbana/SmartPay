# Smart-Pay VPS Deployment Guide

This guide helps you deploy Smart-Pay on your Ubuntu/Debian VPS at `157.173.101.159`.

## Prerequisites

- Ubuntu/Debian Linux VPS
- MongoDB running (local or Atlas)
- MQTT broker running (already configured at `157.173.101.159:1883`)
- Node.js 18+ installed
- PM2 for process management

## Step 1: Connect to Your VPS

```bash
ssh root@157.173.101.159
# or with a user account
ssh username@157.173.101.159
```

## Step 2: Install Node.js (if not already installed)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

## Step 3: Clone/Upload Your Project

### Option A: Using Git
```bash
cd /var/www
git clone <your-github-repo-url> smart-pay
cd smart-pay
```

### Option B: Upload via SCP (from your local machine)
```bash
scp -r D:\Embedded\MasterCard\Smart-pay root@157.173.101.159:/var/www/smart-pay
ssh root@157.173.101.159
cd /var/www/smart-pay
```

## Step 4: Set Up Backend

```bash
cd backend

# Copy example environment file
cp .env.example .env

# Edit the .env file with your actual credentials
nano .env
# Update:
# - MONGODB_URI: Your MongoDB connection string
# - PORT: 9205 (already set)
# - MQTT_BROKER: mqtt://157.173.101.159:1883

# Install dependencies
npm install

# Test locally (optional)
npm run dev
# Should see: "Server running on http://localhost:9205"
```

## Step 5: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 startup
pm2 save
```

## Step 6: Start Backend with PM2

```bash
cd /var/www/smart-pay/backend

# Start the application
pm2 start server.js --name "smart-pay-backend"

# Check status
pm2 status

# View logs
pm2 logs smart-pay-backend

# Make it restart on reboot
pm2 startup
pm2 save
```

## Step 7: Configure Nginx Reverse Proxy (Optional but Recommended)

```bash
sudo apt-get install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/smart-pay
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name 157.173.101.159;

    location / {
        proxy_pass http://localhost:9205;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/smart-pay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 8: Verify Deployment

```bash
# Check if backend is running
curl http://localhost:9205

# Check PM2 status
pm2 status

# Access from browser
# Open: http://157.173.101.159:9205
```

## Step 9: Monitor & Manage

```bash
# Restart the application
pm2 restart smart-pay-backend

# Stop the application
pm2 stop smart-pay-backend

# View real-time logs
pm2 logs smart-pay-backend

# View all running processes
pm2 status
```

## Troubleshooting

### Port Already in Use
```bash
sudo lsof -i :9205
sudo kill -9 <PID>
```

### MongoDB Connection Issues
- Verify MongoDB URI in .env
- Check MongoDB Atlas IP whitelist
- Ensure database is running

### MQTT Connection Issues
```bash
# Test MQTT broker
telnet 157.173.101.159 1883
```

### View Backend Logs
```bash
pm2 logs smart-pay-backend --lines 100
```

## Environment Variables (.env)

Create `.env` file in the `backend/` directory:

```
PORT=9205
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=SmartPay
MQTT_BROKER=mqtt://157.173.101.159:1883
NODE_ENV=production
```

**NEVER commit .env to Git** - it contains sensitive credentials!

## Security Recommendations

1. **Use Firewall**:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 9205/tcp
   sudo ufw enable
   ```

2. **HTTPS Setup** (use Let's Encrypt):
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d your-domain.com
   ```

3. **Keep Dependencies Updated**:
   ```bash
   npm audit fix
   npm update
   ```

4. **Backup Database**:
   ```bash
   # Backup MongoDB
   mongodump --uri="<your-connection-string>" --out=/backups/mongodb
   ```

## Quick Commands Reference

```bash
# Start service
pm2 start /var/www/smart-pay/backend/server.js --name "smart-pay"

# Stop service
pm2 stop smart-pay

# Restart service
pm2 restart smart-pay

# Remove from PM2
pm2 delete smart-pay

# View logs
pm2 logs smart-pay

# Monit service
pm2 monit
```

## Access Your Dashboard

Once deployed, access your dashboard at:
```
http://157.173.101.159:9205
```

Switch between **Admin** (top-up) and **Cashier** (payment) modes from the dashboard.

---

**Deployment Date**: March 1, 2026  
**Dashboard URL**: http://157.173.101.159:9205  
**Backend Port**: 9205
