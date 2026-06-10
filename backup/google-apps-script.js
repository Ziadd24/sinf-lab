/**
 * SINF-VET Automated Backup Script
 * 
 * This Google Apps Script backs up MongoDB data daily to Google Drive
 * Deploy to Google Apps Script: https://script.google.com/
 * 
 * Setup:
 * 1. Create a MongoDB API key at https://cloud.mongodb.com/v2/65xxx#/admin/keys
 * 2. Whitelist your IP: https://cloud.mongodb.com/v2/65xxx#/security/serverless/networkAccess
 * 3. Create folder for backups in Google Drive (copy folder ID from URL)
 * 4. Replace YOUR_API_KEY, YOUR_PROJECT_ID, YOUR_CLUSTER_ID, YOUR_FOLDER_ID below
 * 5. Set trigger: Edit > Current project's triggers > Create trigger
 *    - Function: backupMongoDB
 *    - Deployment: Head
 *    - Event source: Time-driven
 *    - Type of time based trigger: Day timer
 *    - Time of day: 2 AM
 */

// Configuration - REPLACE WITH YOUR VALUES
const MONGODB_API_KEY = 'YOUR_API_KEY'; // From https://cloud.mongodb.com/v2/YOUR_ORG_ID/admin/keys
const MONGODB_PROJECT_ID = 'YOUR_PROJECT_ID'; // From MongoDB cluster settings
const MONGODB_CLUSTER_ID = 'YOUR_CLUSTER_ID'; // From MongoDB cluster settings
const BACKUP_FOLDER_ID = 'YOUR_FOLDER_ID'; // Google Drive folder for backups
const DATABASE_URL = 'YOUR_DATABASE_URL'; // Full connection string
const RETENTION_DAYS = 30; // Keep 30 days of backups

// Main backup function called by trigger
function backupMongoDB() {
  try {
    Logger.log('🔄 Starting MongoDB backup...');
    
    // Export MongoDB data
    const backupData = exportMongoDBData();
    
    if (!backupData) {
      sendNotification('❌ Backup failed: Could not export data');
      return;
    }
    
    // Save to Google Drive
    const fileId = saveBackupToGoogleDrive(backupData);
    
    if (fileId) {
      Logger.log(`✅ Backup completed: ${fileId}`);
      cleanupOldBackups();
      sendNotification(`✅ Daily backup completed at ${new Date().toLocaleString()}`);
    } else {
      sendNotification('❌ Backup failed: Could not save to Drive');
    }
    
  } catch (error) {
    Logger.log(`❌ Error: ${error}`);
    sendNotification(`❌ Backup error: ${error}`);
  }
}

// Export data from MongoDB using HTTP API
function exportMongoDBData() {
  try {
    // This uses MongoDB Data API to fetch data
    // Alternative: Use MongoDB CLI tools if you prefer
    
    const collections = ['samples', 'results', 'catalogs', 'clinics', 'users'];
    const backupData = {
      timestamp: new Date().toISOString(),
      database: 'sinf-vet',
      collections: {}
    };
    
    for (const collection of collections) {
      try {
        const data = fetchMongoDBCollection(collection);
        backupData.collections[collection] = data;
        Logger.log(`📦 Exported ${collection}: ${data.length} documents`);
      } catch (error) {
        Logger.log(`⚠️ Warning exporting ${collection}: ${error}`);
      }
    }
    
    return backupData;
    
  } catch (error) {
    Logger.log(`Error exporting MongoDB: ${error}`);
    return null;
  }
}

// Fetch collection from MongoDB using Data API
function fetchMongoDBCollection(collectionName) {
  // This is a simplified example using MongoDB Data API
  // You may need to adjust based on your connection method
  
  const url = `https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1/action/find`;
  
  const payload = {
    collection: collectionName,
    database: 'sinf-vet'
  };
  
  const options = {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${Utilities.getUuid()}`,
      'api-key': MONGODB_API_KEY,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    return result.documents || [];
  } catch (error) {
    Logger.log(`API fetch error for ${collectionName}: ${error}`);
    return [];
  }
}

// Save backup to Google Drive
function saveBackupToGoogleDrive(backupData) {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `sinf-vet-backup-${timestamp}.json`;
    
    const fileContent = JSON.stringify(backupData, null, 2);
    
    // Get folder
    const folder = DriveApp.getFolderById(BACKUP_FOLDER_ID);
    
    // Create file
    const file = folder.createFile(filename, fileContent, 'application/json');
    
    Logger.log(`✅ Saved backup to Drive: ${filename}`);
    return file.getId();
    
  } catch (error) {
    Logger.log(`Error saving to Drive: ${error}`);
    return null;
  }
}

// Delete old backups (keep only last 30 days)
function cleanupOldBackups() {
  try {
    const folder = DriveApp.getFolderById(BACKUP_FOLDER_ID);
    const files = folder.getFilesByName(/sinf-vet-backup-/);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    
    let deletedCount = 0;
    while (files.hasNext()) {
      const file = files.next();
      if (file.getLastUpdated() < cutoffDate) {
        folder.removeFile(file);
        deletedCount++;
        Logger.log(`🗑️ Deleted old backup: ${file.getName()}`);
      }
    }
    
    if (deletedCount > 0) {
      Logger.log(`🧹 Cleanup: Deleted ${deletedCount} old backups`);
    }
    
  } catch (error) {
    Logger.log(`Warning during cleanup: ${error}`);
  }
}

// Send email notification
function sendNotification(message) {
  try {
    const email = Session.getActiveUser().getEmail();
    
    MailApp.sendEmail(
      email,
      'SINF-VET Backup Status',
      message + '\n\nBackup Folder: https://drive.google.com/drive/folders/' + BACKUP_FOLDER_ID
    );
    
  } catch (error) {
    Logger.log(`Warning sending email: ${error}`);
  }
}

// Manual trigger for testing
function testBackup() {
  Logger.log('🧪 Running backup test...');
  backupMongoDB();
  Logger.log('✅ Test complete. Check logs above.');
}

// Get backup status
function getBackupStatus() {
  try {
    const folder = DriveApp.getFolderById(BACKUP_FOLDER_ID);
    const files = folder.getFilesByName(/sinf-vet-backup-/);
    
    const backups = [];
    while (files.hasNext()) {
      const file = files.next();
      backups.push({
        name: file.getName(),
        date: file.getLastUpdated(),
        size: (file.getSize() / 1024).toFixed(2) + ' KB'
      });
    }
    
    // Sort by date (newest first)
    backups.sort((a, b) => b.date - a.date);
    
    Logger.log(`📊 Backup Status:`);
    Logger.log(`   Total backups: ${backups.length}`);
    Logger.log(`   Latest: ${backups[0]?.name || 'None'}`);
    Logger.log(`   Size: ${backups[0]?.size || 'N/A'}`);
    
    return backups;
    
  } catch (error) {
    Logger.log(`Error getting status: ${error}`);
  }
}
