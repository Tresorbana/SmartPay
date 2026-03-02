# Smart-Pay VPS Deployment - Quick Start

## Your VPS Details
- **Server**: 157.173.101.159
- **OS**: Ubuntu/Debian
- **Dashboard URL**: http://157.173.101.159:9205
- **Backend Port**: 9205

## Files Prepared for Deployment

✅ **server.js** - Updated to use port 9205  
✅ **database.js** - Updated to use environment variables  
✅ **.env.example** - Configuration template  
✅ **DEPLOYMENT.md** - Full deployment guide  
✅ **deploy.sh** - Automated deployment script  

## 3-Step Quick Deployment

### Step 1: Upload Files to VPS
```bash
# From your local machine
scp -r D:\Embedded\MasterCard\Smart-pay root@157.173.101.159:/var/www/smart-pay
```

### Step 2: Connect & Run Deployment Script
```bash
ssh root@157.173.101.159
cd /var/www/smart-pay
chmod +x deploy.sh
./deploy.sh
```

### Step 3: Configure MongoDB Credentials
```bash
nano backend/.env
# Add your MongoDB Atlas connection string
# Then press Ctrl+O, Enter, Ctrl+X to save
```

## What the Script Does
1. ✓ Installs Node.js 20
2. ✓ Installs PM2 process manager
3. ✓ Installs dependencies (npm install)
4. ✓ Creates .env configuration file
5. ✓ Starts backend service
6. ✓ Sets up auto-restart on server reboot

## Verify Deployment
```bash
# Check if running
pm2 status

# View logs
pm2 logs smart-pay-backend

# Test in browser
# Open: http://157.173.101.159:9205
```

## Important Configuration

### MongoDB Connection (.env)
Get your MongoDB URI from MongoDB Atlas:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a database cluster
3. Copy connection string
4. Add to backend/.env:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=SmartPay
```

### MQTT Broker (.env)
Already configured to use your VPS MQTT broker:
```
MQTT_BROKER=mqtt://157.173.101.159:1883
```

## If Something Goes Wrong

### Check Backend Logs
```bash
pm2 logs smart-pay-backend
```

### Restart Service
```bash
pm2 restart smart-pay-backend
```

### Port Already in Use
```bash
sudo lsof -i :9205
sudo kill -9 <PID>
pm2 restart smart-pay-backend
```

## Dashboard Access
Once deployed, access from any browser:
```
http://157.173.101.159:9205
```

**Admin Mode**: Top up RFID cards  
**Cashier Mode**: Process payments  

---
Need help? Check DEPLOYMENT.md for the complete guide.
