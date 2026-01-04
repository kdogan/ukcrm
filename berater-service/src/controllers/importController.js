const { importCustomers, importMeters } = require('../services/excelImportService');
const fs = require('fs').promises;

/**
 * Importiere Kunden aus Excel-Datei
 */
exports.importCustomersFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Keine Datei hochgeladen'
      });
    }

    const filePath = req.file.path;
    const beraterId = req.user._id;

    // Importiere Kunden
    const results = await importCustomers(filePath, beraterId);

    // Lösche temporäre Datei
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Fehler beim Löschen der temporären Datei:', error);
    }

    res.json({
      success: true,
      message: `${results.success} Kunden erfolgreich importiert, ${results.failed} fehlgeschlagen`,
      data: results
    });

  } catch (error) {
    console.error('Fehler beim Kunden-Import:', error);

    // Versuche temporäre Datei zu löschen
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Fehler beim Löschen der temporären Datei:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Fehler beim Importieren der Kunden',
      error: error.message
    });
  }
};

/**
 * Importiere Zähler aus Excel-Datei
 */
exports.importMetersFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Keine Datei hochgeladen'
      });
    }

    const filePath = req.file.path;
    const beraterId = req.user._id;

    // Importiere Zähler
    const results = await importMeters(filePath, beraterId);

    // Lösche temporäre Datei
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Fehler beim Löschen der temporären Datei:', error);
    }

    res.json({
      success: true,
      message: `${results.success} Zähler erfolgreich importiert, ${results.failed} fehlgeschlagen`,
      data: results
    });

  } catch (error) {
    console.error('Fehler beim Zähler-Import:', error);

    // Versuche temporäre Datei zu löschen
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Fehler beim Löschen der temporären Datei:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Fehler beim Importieren der Zähler',
      error: error.message
    });
  }
};
