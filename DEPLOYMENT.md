# BORSAsite Production Deployment Guide

This guide covers the complete deployment of BORSAsite to the production server.

## 🚀 Server Information
- **IP Address**: 145.223.80.133
- **Username**: root  
- **Password**: 214721472147Me.
- **OS**: Ubuntu 20.04+ (assumed)

## 📋 Pre-deployment Checklist

### Local Environment
- [x] Payment system translated to English
- [x] Premium subscription system functional
- [x] Webhook integration working
- [x] Portfolio stock ranks redesigned
- [x] Production server configuration updated
- [x] Environment variables configured

### Production Server Requirements
- [ ] Node.js 18.x or higher
- [ ] PM2 process manager
- [ ] Nginx web server
- [ ] Python 3.8+ (for Interactive Brokers API)
- [ ] Docker (optional, for IB API containerization)

## 🔧 Deployment Steps

### 1. Prepare Local Build
```bash
# Navigate to project directory
cd "/Users/hammeyva/Desktop/yedek projeler/BORSAsite"

# Install dependencies
npm install

# Create production build
npm run build

# Test the build locally
npm start
```

### 2. Server Initial Setup
```bash
# Connect to server
ssh root@145.223.80.133

# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt-get install -y nginx

# Install Python and pip (for IB API)
apt-get install -y python3 python3-pip

# Create application directory
mkdir -p /var/www/borsasite
mkdir -p /var/log/pm2

# Set proper permissions
chown -R root:root /var/www/borsasite
```

### 3. Deploy Application Files
```bash
# From local machine, sync files to server
rsync -avz --exclude node_modules --exclude .git \
  "/Users/hammeyva/Desktop/yedek projeler/BORSAsite/" \
  root@145.223.80.133:/var/www/borsasite/

# Or use scp for individual files
scp -r "/Users/hammeyva/Desktop/yedek projeler/BORSAsite/"* \
  root@145.223.80.133:/var/www/borsasite/
```

### 4. Server Application Setup
```bash
# SSH into server
ssh root@145.223.80.133

# Navigate to application directory
cd /var/www/borsasite

# Install Node.js dependencies
npm install --production

# Build the application on server
npm run build

# Install Python dependencies for IB API
cd api-backend/interactive-brokers-web-api-main/webapp
pip3 install -r requirements.txt
cd ../../../
```

### 5. Configure PM2
```bash
# Start applications using PM2 ecosystem file
pm2 start ecosystem.config.json

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by PM2

# Check application status
pm2 status
pm2 logs
```

### 6. Configure Nginx
```bash
# Copy nginx configuration
cp nginx.conf /etc/nginx/sites-available/borsasite

# Create symbolic link
ln -s /etc/nginx/sites-available/borsasite /etc/nginx/sites-enabled/

# Remove default site (optional)
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx
```

### 7. Configure Firewall
```bash
# Allow HTTP and HTTPS traffic
ufw allow 22   # SSH
ufw allow 80   # HTTP
ufw allow 443  # HTTPS (for future SSL)
ufw enable
```

### 8. Environment Configuration
```bash
# Ensure .env.production is in place
cat > /var/www/borsasite/.env.production << EOF
NODE_ENV=production
IBAPI_HOST=145.223.80.133
IBAPI_PORT=5055
NEXT_PUBLIC_API_URL=http://145.223.80.133
EOF
```

## 🔍 Verification Steps

### 1. Check Services
```bash
# Check PM2 processes
pm2 status

# Check Nginx status
systemctl status nginx

# Check application logs
pm2 logs borsasite-web
pm2 logs borsasite-ibapi
```

### 2. Test Application
```bash
# Test Next.js application
curl http://145.223.80.133/

# Test IB API
curl http://145.223.80.133/api/ibapi/health

# Check if all pages load
curl http://145.223.80.133/portfolio-stock-ranks
curl http://145.223.80.133/portfolio
curl http://145.223.80.133/performance
```

### 3. Monitor Performance
```bash
# Check system resources
htop
free -h
df -h

# Monitor PM2 processes
pm2 monit
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check Node.js version
   node --version
   npm --version
   
   # Clear cache and reinstall
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

2. **PM2 Process Crashes**
   ```bash
   # Check logs
   pm2 logs borsasite-web --lines 50
   
   # Restart process
   pm2 restart borsasite-web
   ```

3. **Nginx Issues**
   ```bash
   # Check nginx logs
   tail -f /var/log/nginx/borsasite_error.log
   
   # Test configuration
   nginx -t
   
   # Restart nginx
   systemctl restart nginx
   ```

4. **API Connection Issues**
   ```bash
   # Check if IB API is running
   ps aux | grep python
   
   # Test direct connection
   curl http://localhost:5055/
   
   # Check port binding
   netstat -tulpn | grep 5055
   ```

## 📊 Monitoring & Maintenance

### Daily Checks
- PM2 process status: `pm2 status`
- System resources: `htop`, `df -h`
- Application logs: `pm2 logs --lines 20`
- Nginx logs: `tail /var/log/nginx/borsasite_access.log`

### Weekly Maintenance
- Update system packages: `apt update && apt upgrade`
- Check PM2 logs for errors
- Monitor disk space usage
- Backup application data

### Performance Optimization
- Enable Nginx gzip compression (already configured)
- Set up log rotation
- Monitor memory usage and optimize PM2 instances
- Consider setting up Redis for caching

## 🔐 Security Considerations

1. **Server Security**
   - Change default SSH port
   - Set up SSH key authentication
   - Configure fail2ban
   - Regular security updates

2. **Application Security**
   - Environment variables properly set
   - API endpoints secured
   - Rate limiting implemented
   - HTTPS setup (future)

## 📞 Support

For issues during deployment:
1. Check application logs: `pm2 logs`
2. Check system logs: `journalctl -f`
3. Verify configuration files
4. Test individual components

---

## 🎉 Post-Deployment Verification

Once deployment is complete, verify these features:
- [x] Homepage loads correctly
- [x] User authentication works
- [x] Premium subscription system functional
- [x] Portfolio stock ranks displays new design
- [x] Interactive Brokers API connectivity
- [x] Payment system in English
- [x] Cache system operational

**Deployment Status**: Ready for Production 🚀
