# 🚀 Production Deployment Guide: Vercel + MongoDB + PWA

Complete step-by-step guide to deploy SINF-VET to production with free hosting.

---

## 📋 Prerequisites

- GitHub account
- MongoDB Atlas account (free)
- Vercel account (free)
- Google Drive account (for backups)

**Time Required:** 45 minutes (one-time setup)

---

## ✅ Step 1: Setup MongoDB Atlas (Database)

MongoDB Atlas provides free database hosting (512 MB storage = perfect for one clinic).

### 1.1 Create MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Login
3. Create a new project: "SINF-VET"
4. Click "Create a Deployment" → Choose "M0 (Free)"
5. Select region: **Saudi Arabia** (if available) or nearest region
6. Click "Create Deployment"

### 1.2 Setup Network Access

1. In MongoDB Atlas dashboard, go to **Security → Network Access**
2. Click **"Add IP Address"**
3. Select **"Allow access from anywhere"** (necessary for Vercel)
   - This adds `0.0.0.0/0` to the whitelist
4. Click **"Confirm"**

⚠️ **Note:** This is safe because Vercel IPs are dynamic. MongoDB connection requires username/password authentication.

### 1.3 Create Database User

1. Go to **Security → Database Access**
2. Click **"Create a Database User"**
3. Enter:
   - **Username:** `sinfvet`
   - **Password:** Generate strong password (copy it!)
4. Click **"Create User"**

### 1.4 Get Connection String

1. Go to **Deployment → Databases**
2. Click **"Connect"** on your cluster
3. Select **"Drivers"** → **"Node.js"**
4. Copy the connection string:
   ```
   mongodb+srv://sinfvet:<password>@cluster0.xxxxx.mongodb.net/sinf-vet?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your database password from step 1.3

✅ **Save this connection string** - you'll need it for Vercel!

---

## 📁 Step 2: Setup Code on GitHub

### 2.1 Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **"New Repository"**
3. Name: `sinf-vet-system`
4. Choose **Private** (for medical data)
5. Click **"Create Repository"**

### 2.2 Initialize Git Locally

```powershell
# In your project folder
cd "d:\ziad 2026\sinf-vet-system"

# Initialize git
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/sinf-vet-system.git

# Create .gitignore
@"
node_modules/
.env
.env.local
.next/
dist/
build/
*.log
.DS_Store
"@ | Out-File .gitignore

# Add all files
git add .

# Commit
git commit -m "Initial SINF-VET commit"

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2.3 Verify GitHub

- Visit `https://github.com/YOUR_USERNAME/sinf-vet-system`
- Confirm all files are uploaded
- ✅ Check that `.env` is NOT visible (should be in .gitignore)

---

## 🌐 Step 3: Deploy to Vercel

Vercel automatically deploys your Next.js app. Every push to GitHub triggers a new deployment.

### 3.1 Connect GitHub to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up / Login (recommend using GitHub)
3. Click **"New Project"**
4. Click **"Import Git Repository"**
5. Search for `sinf-vet-system`
6. Click **"Import"**

### 3.2 Configure Environment Variables

Vercel needs your database connection string and secrets:

1. In Vercel project settings, go to **Settings → Environment Variables**
2. Add the following (one at a time):

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `mongodb+srv://sinfvet:PASSWORD@cluster...` | Your MongoDB connection string |
| `NEXTAUTH_URL` | `https://YOUR_DOMAIN.vercel.app` | Vercel domain (auto-populated) |
| `NEXTAUTH_SECRET` | `generate-with-openssl` | See below |

### 3.3 Generate NEXTAUTH_SECRET

```powershell
# PowerShell on Windows
$bytes = [byte[]]::new(32)
[Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

This generates a cryptographically secure 32-byte secret. Copy the output and paste it into `NEXTAUTH_SECRET`.

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait 3-5 minutes for deployment to complete
3. You'll see: **"Congratulations! Your site is live at https://YOUR_DOMAIN.vercel.app"**

✅ **Your app is now live!**

---

## 🔐 Step 4: Verify Deployment

### 4.1 Test Login

1. Visit `https://YOUR_DOMAIN.vercel.app/login`
2. Login with test user:
   - **Email:** `admin@sinfvet.local`
   - **Password:** `admin123` (set in prisma/seed.ts)
3. You should see the dashboard

### 4.2 Test Database Connection

1. Click **"Enter Results"** → Add a test result
2. Submit the form
3. Go back to Dashboard
4. Verify result appears ✅

### 4.3 Check Audit Trail

1. Go to **Admin → Audit Log**
2. Verify your actions are logged with timestamps

### 4.4 Test Offline (PWA)

1. On desktop/laptop: Right-click → **"Install app"**
2. On mobile: Browser menu → **"Install app"**
3. Go offline (disconnect WiFi)
4. Open the app from home screen
5. Verify cached data loads ✅

---

## 🔄 Step 5: Setup Automated Backups

### 5.1 Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create folder: **"SINF-VET Backups"**
3. Copy folder ID from URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

### 5.2 Deploy Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Create new project: **"SINF-VET Backup"**
3. Copy entire content from `/backup/google-apps-script.js` into editor
4. Replace these values:
   ```javascript
   const MONGODB_API_KEY = 'YOUR_API_KEY';
   const MONGODB_PROJECT_ID = 'YOUR_PROJECT_ID';
   const MONGODB_CLUSTER_ID = 'YOUR_CLUSTER_ID';
   const BACKUP_FOLDER_ID = 'YOUR_FOLDER_ID';
   const DATABASE_URL = 'YOUR_DATABASE_URL';
   ```

5. Click **"Save"** (Ctrl+S)

### 5.3 Test Backup

1. Click **"Run"** → Select **"testBackup"** function
2. Click play (▶️) icon
3. Check logs (View → Logs)
4. Should see: ✅ Backup file created
5. Check Google Drive → SINF-VET Backups folder
6. Should see: `sinf-vet-backup-YYYY-MM-DD...json` file

### 5.4 Setup Daily Schedule

1. Go to **Edit → Current project's triggers**
2. Click **"Create trigger"**
3. Configure:
   - **Function:** `backupMongoDB`
   - **Deployment:** Head
   - **Event source:** Time-driven
   - **Type:** Day timer
   - **Time:** 2 AM
   - **Timezone:** Asia/Riyadh
4. Click **"Save"**

✅ **Your backups now run automatically every day at 2 AM!**

---

## 📱 Step 6: Install PWA on Client Devices

### For Desktop (Windows/Mac)

1. Open `https://YOUR_DOMAIN.vercel.app` in Chrome
2. Address bar → Click **"Install"** icon (right side)
3. Click **"Install"**
4. App is now on your desktop!

### For Mobile (iPhone/Android)

**Android:**
1. Open `https://YOUR_DOMAIN.vercel.app` in Chrome
2. Menu (⋮) → **"Install app"**
3. App is now on your home screen

**iPhone:**
1. Open `https://YOUR_DOMAIN.vercel.app` in Safari
2. Share button → **"Add to Home Screen"**
3. App is now on your home screen

### Offline Usage

- **Read Results:** Works offline (cached data)
- **Enter Results:** Works offline (queues locally)
- **Approve Results:** Requires internet (verification needed)
- **Sync:** Automatic when back online

---

## 🆘 Troubleshooting

### Issue: "Database connection failed"

**Solution:**
1. Verify MongoDB connection string in Vercel environment
2. Check MongoDB Network Access allows `0.0.0.0/0`
3. Verify database user password doesn't contain special URL chars (use URL encoding)
4. Test connection locally: `npm run dev`

### Issue: "Login not working"

**Solution:**
1. Check `NEXTAUTH_SECRET` is set in Vercel
2. Verify `NEXTAUTH_URL` matches your Vercel domain
3. Run seed to create test users: `npm run seed`
4. Check browser console for errors (F12)

### Issue: "PWA not installing"

**Solution:**
1. Must be HTTPS (Vercel is automatic ✅)
2. Must have manifest.json (we added it ✅)
3. Must have service worker (we added it ✅)
4. Clear browser cache: Ctrl+Shift+Delete
5. Try again in 5 minutes

### Issue: "Backup not running"

**Solution:**
1. Check Google Apps Script logs for errors
2. Verify MongoDB API key is correct
3. Verify Drive folder ID is correct
4. Try running `testBackup()` manually
5. Check spam folder for backup notification emails

### Issue: "Cold start delays"

**Solution:**
- Vercel free tier can take 3-5 seconds on first request
- This is normal and acceptable for clinic usage during business hours
- Upgrade to Pro tier ($20/mo) for faster cold starts if needed

---

## 📊 Monitoring Checklist

**Weekly:**
- [ ] Check backup status in Google Drive
- [ ] Verify at least 7 backup files exist
- [ ] Open app and test login
- [ ] Enter test result and verify it saves

**Monthly:**
- [ ] Review Audit Log for suspicious activity
- [ ] Check MongoDB usage (should be <100 MB)
- [ ] Verify offline functionality still works
- [ ] Test data recovery from backup

---

## 🔐 Security Best Practices

1. **Environment Variables:** Never commit `.env` to GitHub
2. **Database User:** Use strong passwords (20+ characters)
3. **MongoDB Access:** Only allow IP whitelist, not `0.0.0.0/0` in production
   - Get Vercel IP ranges from docs
   - Or use VPN tunnel for secure connection
4. **Backups:** Store on private Google Drive folder
5. **HTTPS:** Always use HTTPS (Vercel automatic)
6. **Session Timeout:** Add session timeout after 1 hour of inactivity

---

## 💰 Cost Summary

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Vercel** | 100 GB bandwidth, 100 function calls/sec | FREE |
| **MongoDB Atlas** | 512 MB storage, 512 MB data transfer | FREE |
| **Google Drive** | 15 GB storage (backups use ~600 MB/month) | FREE |
| **Google Apps Script** | 30 min/day execution | FREE |
| **Total Monthly Cost** | All services | **$0** ✅ |

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

---

## ✅ Deployment Complete!

Your SINF-VET system is now:
- ✅ Live on Vercel
- ✅ Connected to MongoDB
- ✅ Installable as PWA
- ✅ Works offline with sync
- ✅ Backed up daily automatically
- ✅ Audit trail logging all actions
- ✅ Zero monthly cost

**Next Steps:**
1. Add clinic users (doctors, technicians)
2. Configure test catalogs and panic values
3. Train staff on system usage
4. Monitor first week for issues

Questions? Contact: support@sinfvet.com
