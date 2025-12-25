const cron = require('node-cron');
const Contract = require('../models/Contract');
const fs = require('fs');
const path = require('path');

/**
 * Löscht Anhänge die älter als 3 Jahre sind
 * Läuft täglich um 02:00 Uhr
 */
const cleanupOldAttachments = async () => {
  try {
    console.log('[Attachment Cleanup] Starting cleanup job...');

    // Datum vor 3 Jahren berechnen
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    let totalDeleted = 0;
    let totalFileSize = 0;

    // Alle Verträge mit Anhängen finden
    const contracts = await Contract.find({
      'attachments.0': { $exists: true } // Nur Verträge mit mindestens einem Anhang
    });

    for (const contract of contracts) {
      const attachmentsToDelete = [];
      const attachmentsToKeep = [];

      // Anhänge nach Alter filtern
      for (const attachment of contract.attachments) {
        const uploadDate = new Date(attachment.uploadedAt);

        if (uploadDate < threeYearsAgo) {
          attachmentsToDelete.push(attachment);
        } else {
          attachmentsToKeep.push(attachment);
        }
      }

      // Wenn alte Anhänge gefunden wurden
      if (attachmentsToDelete.length > 0) {
        for (const attachment of attachmentsToDelete) {
          try {
            // Datei vom Dateisystem löschen
            if (fs.existsSync(attachment.path)) {
              const fileSize = fs.statSync(attachment.path).size;
              fs.unlinkSync(attachment.path);
              totalFileSize += fileSize;

              console.log(`[Attachment Cleanup] Deleted file: ${attachment.originalName} (${attachment._id})`);
            } else {
              console.log(`[Attachment Cleanup] File not found: ${attachment.path}`);
            }

            totalDeleted++;
          } catch (error) {
            console.error(`[Attachment Cleanup] Error deleting file ${attachment.path}:`, error.message);
          }
        }

        // Vertrag aktualisieren - nur neue Anhänge behalten
        contract.attachments = attachmentsToKeep;
        await contract.save();

        console.log(`[Attachment Cleanup] Contract ${contract.contractNumber}: Removed ${attachmentsToDelete.length} old attachments`);
      }
    }

    // Zusammenfassung
    const totalSizeMB = (totalFileSize / (1024 * 1024)).toFixed(2);
    console.log(`[Attachment Cleanup] Cleanup completed:`);
    console.log(`  - Total attachments deleted: ${totalDeleted}`);
    console.log(`  - Total disk space freed: ${totalSizeMB} MB`);
    console.log(`  - Threshold date: ${threeYearsAgo.toISOString()}`);

  } catch (error) {
    console.error('[Attachment Cleanup] Error during cleanup:', error);
  }
};

/**
 * Startet den Cron-Job für automatische Bereinigung
 * Läuft täglich um 02:00 Uhr
 */
const startAttachmentCleanupJob = () => {
  // Cron Schedule: Täglich um 02:00 Uhr
  // Format: Sekunde Minute Stunde Tag Monat Wochentag
  cron.schedule('0 2 * * *', async () => {
    console.log('[Attachment Cleanup] Running scheduled cleanup job at 02:00');
    await cleanupOldAttachments();
  });

  console.log('[Attachment Cleanup] Cron job scheduled: Daily at 02:00');
};

module.exports = {
  cleanupOldAttachments,
  startAttachmentCleanupJob
};
