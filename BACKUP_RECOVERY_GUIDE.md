# 🔄 Backup & Recovery Guide

Complete guide to data backup, recovery, and disaster recovery procedures for SINF-VET.

---

## 📊 Backup Strategy Overview

| Aspect | Details |
|--------|---------|
| **Frequency** | Daily at 2 AM (Riyadh time) |
| **Retention** | 30-day rolling window (auto-cleanup) |
| **Location** | Google Drive (15 GB free tier) |
| **Storage Used** | ~20 MB per backup = 600 MB/month |
| **Encryption** | Google Drive encryption + HTTPS |
| **Recovery Time** | ~30 minutes to full restore |
| **Cost** | FREE ✅ |

---

## 🗂️ What Gets Backed Up

**Included:**
- ✅ All samples (سحات)
- ✅ All test results (النتائج)
- ✅ All approvals & audit trail
- ✅ User accounts & roles
- ✅ Clinic information
- ✅ Test catalogs
- ✅ Validation rules

**Not included (stateless):**
- Session tokens (expire anyway)
- Cache files (regenerated on deploy)

---

## ✅ Automated Daily Backups

### How It Works

1. **Google Apps Script** runs at 2 AM daily
2. Connects to MongoDB and exports data
3. Saves as JSON file to Google Drive
4. Cleans up files older than 30 days
5. Sends email notification with status

### Backup File Format

```
sinf-vet-backup-2024-01-15T02-00-00.json
├── timestamp: "2024-01-15T02:00:00Z"
├── database: "sinf-vet"
└── collections:
    ├── samples: [...]
    ├── results: [...]
    ├── catalogs: [...]
    ├── clinics: [...]
    └── users: [...]
```

### Check Backup Status

**Via Google Apps Script:**
1. Go to [Google Apps Script](https://script.google.com)
2. Open your "SINF-VET Backup" project
3. Go to **View → Logs**
4. See latest backup status

**Via Google Drive:**
1. Open Google Drive
2. Go to **"SINF-VET Backups"** folder
3. Should see one file per day
4. Latest file should be today's date

---

## 🔄 Manual Backups (Optional)

### Method 1: Google Apps Script (Recommended)

If you want to backup outside the 2 AM schedule:

1. Go to [Google Apps Script](https://script.google.com)
2. Open your "SINF-VET Backup" project
3. Select **"testBackup"** from dropdown
4. Click play (▶️) icon
5. Wait 2-5 minutes
6. Check logs for status

### Method 2: MongoDB Compass GUI

If you have MongoDB Compass installed locally:

```bash
# Export all collections to JSON
mongoexport --uri "mongodb+srv://sinfvet:password@cluster.mongodb.net/sinf-vet" \
            --collection samples \
            --out samples_backup.json

mongoexport --uri "mongodb+srv://sinfvet:password@cluster.mongodb.net/sinf-vet" \
            --collection results \
            --out results_backup.json
```

### Method 3: Manual Download from Google Drive

1. Open Google Drive → **"SINF-VET Backups"** folder
2. Right-click any backup file
3. Select **"Download"**
4. Save to local USB drive

---

## 🆘 Recovery Procedures

### Scenario 1: Recover Single Record (Lost/Corrupted)

**Example:** Doctor accidentally deleted a sample result.

**Steps:**
1. Open latest backup file from Google Drive
2. Search for the record by ID or date
3. Copy the JSON record
4. Contact developer to restore it
   - OR manually re-enter if simple data

**Time:** 5-10 minutes

### Scenario 2: Restore to Previous Point in Time

**Example:** Bulk data entry error, need to undo last day's work.

**Steps:**
1. Stop the application
2. Download backup from **2 days ago**
3. Clear MongoDB database
4. Re-seed with backup data
5. Restart application

**Time:** 20-30 minutes (requires developer)

### Scenario 3: Full System Failure (Catastrophic)

**Example:** MongoDB cluster deleted accidentally, Vercel app broken.

**Steps:**

1. **Create new MongoDB cluster:**
   - Follow MongoDB Atlas setup (Step 1 of deployment guide)
   - Get new connection string

2. **Update Vercel environment:**
   - Go to Vercel → Settings → Environment Variables
   - Update `DATABASE_URL` with new connection string

3. **Restore data from backup:**
   ```bash
   # Download backup file from Google Drive
   # Run restore script (if available) or:
   
   mongoimport --uri "mongodb+srv://sinfvet:password@NEW_CLUSTER..." \
               --collection samples \
               --file samples_backup.json \
               --jsonArray
   ```

4. **Redeploy Vercel:**
   - Vercel auto-deploys, but trigger new deploy:
   - Go to Vercel dashboard → Deployments → Redeploy

5. **Verify restoration:**
   - Visit app URL
   - Login and check data is present
   - Review audit log for recovery actions

**Time:** 30-45 minutes

---

## 📈 Recovery Time Objectives (RTO)

| Scenario | Time | Impact |
|----------|------|--------|
| Single record loss | 10 min | None (1 record restored) |
| Yesterday's work undo | 30 min | Clinic closed for 30 min |
| Full system failure | 45 min | Clinic down ~1 hour |

---

## 🧪 Backup Testing

### Monthly Backup Test

**First Monday of every month, test recovery process:**

1. Download backup file from Google Drive
2. Verify file is readable JSON
3. Check file size is reasonable (20-50 MB)
4. Verify it contains latest data:
   - Open file in text editor
   - Search for today's date
   - Confirm recent records exist

**Document:**
- Date tested
- File downloaded
- Size and record count
- Any issues found

### Annual Full Recovery Test

**Once per year, test full recovery:**

1. Create test MongoDB cluster
2. Restore from backup to test cluster
3. Verify data integrity:
   - Check sample count matches production
   - Verify audit trail is intact
   - Check approvals are recorded
4. Delete test cluster
5. Document recovery procedure and time taken

---

## 🚨 Disaster Recovery Plan

### If Backups Stop (No Backup Files Created)

**Warning Signs:**
- No backup file for today/yesterday
- Google Apps Script errors in logs

**Recovery:**
1. Check Google Apps Script logs for errors
2. Verify MongoDB credentials still valid
3. Test manual backup via `testBackup()`
4. If still failing, reconfigure script with new credentials

**Prevention:**
- Check backup status weekly
- Set calendar reminder to verify backups

### If MongoDB Cluster is Compromised

**Signs:**
- Unauthorized data access
- Unexpected changes to audit log
- Performance issues

**Response:**
1. Change database password immediately
   - MongoDB Atlas → Database Access → Edit user
2. Review audit trail for unauthorized changes
3. Check Vercel logs for suspicious activity
4. Consider recovery from last clean backup
5. File security incident report

### If Vercel Deployment Fails

**Signs:**
- App shows 502/503 error
- Cannot access at all

**Recovery:**
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Revert to last working deployment:
   - Vercel → Deployments → Select previous → Redeploy
4. Contact Vercel support if critical

---

## 📋 Backup Verification Checklist

**Daily (Automated):**
- [ ] Google Apps Script runs at 2 AM
- [ ] Email notification sent
- [ ] Backup file created in Google Drive

**Weekly:**
- [ ] Check backup folder has 7 files (one per day)
- [ ] Verify file sizes are consistent (~20-30 MB)
- [ ] Open latest file in text editor, spot-check data

**Monthly:**
- [ ] Download backup file
- [ ] Verify it's valid JSON
- [ ] Test recovery procedure (dry run)
- [ ] Document any issues

**Quarterly:**
- [ ] Full backup & recovery test
- [ ] Update recovery procedures if needed
- [ ] Train new staff on recovery process

---

## 🔐 Backup Security

### Data Protection

- ✅ Google Drive encryption at rest
- ✅ HTTPS encryption in transit
- ✅ MongoDB connections use SSL/TLS
- ✅ No passwords stored in backups
- ✅ No personal health data outside clinical context

### Access Control

- Only clinic admin has Google Drive access
- Only clinic admin can run recovery procedures
- Backups stored in private Google Drive folder
- Backup script only accessible to administrators

### Compliance

- ✅ Backups meet Saudi GDPR equivalents
- ✅ Data retention policy: 30 days (auto-cleanup)
- ✅ Audit trail preserved with backups
- ✅ Recovery documented for compliance

---

## 📞 Support & Contacts

**If backup fails:**
1. Check logs in Google Apps Script
2. Verify MongoDB credentials
3. Verify Google Drive folder ID
4. Contact: support@sinfvet.com

**For recovery:**
1. Download backup file from Google Drive
2. Note the backup date/time
3. Contact developer with recovery scope
4. Provide estimated RTO needed

**Emergency Recovery (Clinic Closed):**
- Contact on-call developer immediately
- Have latest backup file ready
- Provide MongoDB/Vercel credentials

---

## 📚 Recovery Runbooks

### Runbook 1: Restore Single Result

**Prerequisite:** Know the result ID

```bash
# 1. Download backup
# 2. Open in text editor, search for result ID
# 3. Copy JSON object
# 4. Contact developer to restore to MongoDB
```

**Expected Time:** 5 minutes
**Impact:** None (one record only)

### Runbook 2: Undo Last Day's Work

**Prerequisite:** Know what day to revert to

```bash
# 1. Stop application (take Vercel offline)
# 2. Download backup from desired date
# 3. Import to MongoDB (replaces all data)
# 4. Restart application
# 5. Audit trail will show recovery action
```

**Expected Time:** 30 minutes
**Impact:** Clinic offline during restore

### Runbook 3: Migrate to New Server

**Prerequisite:** New MongoDB cluster created

```bash
# 1. Download latest backup
# 2. Create new MongoDB database
# 3. Import backup to new database
# 4. Update Vercel connection string
# 5. Redeploy
# 6. Verify all data present
```

**Expected Time:** 45 minutes
**Impact:** Clinic offline for 30+ minutes

---

## ✅ Final Checklist

Before considering deployment complete:

- [ ] Automated backup running at 2 AM
- [ ] First backup file created in Google Drive
- [ ] Manual backup test successful
- [ ] Recovery procedure documented
- [ ] Staff trained on recovery (if applicable)
- [ ] Quarterly recovery test scheduled
- [ ] Backup monitoring in place
- [ ] Disaster recovery plan communicated

---

**Questions?** Contact the development team or support@sinfvet.com

Last Updated: January 2024
