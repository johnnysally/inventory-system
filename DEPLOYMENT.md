# SawelaCapella Inventory Management System - Deployment Guide

## Production Deployment

This guide covers deploying the SawelaCapella Inventory Management System to a production environment.

## Prerequisites

- Node.js 16+ and npm 7+ installed
- 2GB RAM minimum
- 500MB disk space
- Database backup solution (recommended)

## Deployment Steps

### 1. Prepare the Server

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y  # Linux only

# Clone or transfer the project
git clone <repository-url>
cd buildtrack-inventory-main
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Configure Environment

Create `.env` files from examples:

**backend/.env:**
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=./data/inventory.db
JWT_SECRET=<generate-strong-random-string>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Frontend .env.local:**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=SawelaCapella Inventory Management System
```

### 4. Initialize Database

```bash
cd backend
npm run db:init

# Optionally seed sample data
npm run db:seed
cd ..
```

### 5. Build for Production

```bash
# Frontend production build
npm run build

# Backend TypeScript compilation
cd backend
npm run build
cd ..
```

### 6. Setup Reverse Proxy (Nginx Example)

Create `/etc/nginx/sites-available/scp-inventory`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend
    root /var/www/html/buildtrack-inventory-main/dist;
    
    location / {
        try_files $uri /index.html =404;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Large file uploads
        client_max_body_size 50M;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/scp-inventory /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Setup Process Manager (PM2)

Install PM2:
```bash
sudo npm install -g pm2
```

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'scp-backend',
    script: './backend/dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### 8. Setup Automatic Backups

Create backup script `backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/scp-inventory"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/var/www/html/buildtrack-inventory-main/backend/data/inventory.db"

mkdir -p $BACKUP_DIR

# Backup database
cp $DB_FILE $BACKUP_DIR/inventory_$DATE.db

# Compress
gzip $BACKUP_DIR/inventory_$DATE.db

# Keep only last 30 days
find $BACKUP_DIR -name "inventory_*.db.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/inventory_$DATE.db.gz"
```

Add to crontab for daily backups at 2 AM:
```bash
sudo crontab -e

# Add line:
0 2 * * * /var/www/html/buildtrack-inventory-main/backup.sh
```

### 9. Status Monitoring

Check service status:
```bash
pm2 status
pm2 logs scp-backend

# Monitor in real time
pm2 monit
```

View Nginx errors:
```bash
tail -f /var/log/nginx/error.log
```

### 10. Database Maintenance

Regular maintenance tasks:

```bash
# View database size
du -h backend/data/inventory.db

# Optimize database
sqlite3 backend/data/inventory.db "VACUUM;"

# Check integrity
sqlite3 backend/data/inventory.db "PRAGMA integrity_check;"
```

## Performance Optimization

### Frontend (CDN)

Use a CDN to serve static assets:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Backend (Connection Pooling)

For SQLite, consider options:
- **Better-sqlite3** for production workloads
- **Multiple read replicas** for high read scenarios
- **Connection pooling** middleware

### Database

```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_inventory_department ON inventory_items(department);
CREATE INDEX idx_inventory_quantity ON inventory_items(quantity);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_item_id ON transactions(item_id);
```

## Security Best Practices

1. **Change Default Credentials**
   - Update all default user passwords immediately
   - Use strong passwords (12+ characters)

2. **Environment Variables**
   - Never commit `.env` files
   - Use `.env.example` for templates
   - Regenerate JWT secrets before production

3. **HTTPS/SSL**
   - Use Let's Encrypt for free certificates
   - Enable SSL/TLS for all connections
   - Use `Strict-Transport-Security` header

4. **Database Security**
   - Regular backups on separate storage
   - Encrypt sensitive data
   - Restrict database file permissions (644)

5. **API Security**
   - Rate limiting on authentication endpoints
   - CORS whitelist only trusted domains
   - Input validation and sanitization
   - SQL injection prevention (using parameterized queries)

6. **Logging & Monitoring**
   - Enable access logs
   - Monitor error logs regularly
   - Set up alerts for critical errors
   - Use monitoring tools (Prometheus, Grafana)

## Scaling

For growth beyond single server:

1. **Separate Backend & Frontend**
   - Host frontend on CDN
   - Run backend on dedicated app server
   - Use database replication

2. **Load Balancing**
   - Use Nginx/HAProxy for load balancing
   - Run multiple backend instances
   - Use session storage (Redis)

3. **Database**
   - Consider PostgreSQL for better scalability
   - Implement database replication
   - Archive old transaction data

## Troubleshooting Production

### High Memory Usage
```bash
pm2 kill  # Stop all processes
rm -rf node_modules
npm install
pm2 start ecosystem.config.js
```

### Database Lock Errors
```bash
# Restart backend to release locks
pm2 restart scp-backend

# Check for stuck processes
lsof | grep inventory.db
```

### Slow Performance
- Check logs for errors
- Monitor database size
- Verify backend is running
- Check server resources (CPU, RAM, Disk)

## Monitoring Checklist

- [ ] Backend service running (pm2 status)
- [ ] Nginx reverse proxy active
- [ ] HTTPS/SSL certificates valid
- [ ] Database backups recent
- [ ] Log files monitored
- [ ] Security updates applied
- [ ] System resources healthy
- [ ] User accounts secured

---

**Last Updated**: March 2026
