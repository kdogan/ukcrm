const XLSX = require('xlsx');
const Customer = require('../models/Customer');
const Meter = require('../models/Meter');

/**
 * Importiert Kunden aus einer Excel-Datei
 * Erwartete Spalten: Anrede, Accountname, Mobiltelefon, E-Mail
 */
exports.importCustomers = async (filePath, beraterId) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const results = {
      success: 0,
      failed: 0,
      errors: [],
      imported: []
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        // Accountname aufteilen in firstName und lastName
        const accountName = row['Accountname'] || '';
        const nameParts = accountName.split(',').map(part => part.trim());

        const lastName = nameParts[0] || '';
        const firstName = nameParts[1] || '';

        // Überprüfe ob Kunde bereits existiert (basierend auf E-Mail oder Namen)
        const email = row['E-Mail'];
        let existingCustomer = null;

        if (email) {
          existingCustomer = await Customer.findOne({
            beraterId,
            email: email.toLowerCase()
          });
        }

        if (!existingCustomer && firstName && lastName) {
          existingCustomer = await Customer.findOne({
            beraterId,
            firstName,
            lastName
          });
        }

        if (existingCustomer) {
          results.errors.push({
            row: i + 2, // Excel row number (1-based + header)
            data: row,
            error: 'Kunde existiert bereits'
          });
          results.failed++;
          continue;
        }

        // Erstelle neuen Kunden
        const customer = await Customer.create({
          beraterId,
          firstName,
          lastName,
          anrede: row['Anrede'] || 'Herr',
          email: email ? email.toLowerCase() : undefined,
          phone: row['Mobiltelefon'] || undefined
        });

        results.imported.push(customer);
        results.success++;

      } catch (error) {
        results.errors.push({
          row: i + 2,
          data: row,
          error: error.message
        });
        results.failed++;
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Fehler beim Lesen der Excel-Datei: ${error.message}`);
  }
};

/**
 * Importiert Zähler aus einer Excel-Datei
 * Erwartete Spalten: Zählernummer, Zählerart, Anschrift (Straße), Anschrift (Postleitzahl), Anschrift (Stadt)
 */
exports.importMeters = async (filePath, beraterId) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const results = {
      success: 0,
      failed: 0,
      errors: [],
      imported: []
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        const meterNumber = String(row['Zählernummer'] || '').trim();

        if (!meterNumber) {
          results.errors.push({
            row: i + 2,
            data: row,
            error: 'Zählernummer fehlt'
          });
          results.failed++;
          continue;
        }

        // Überprüfe ob Zähler bereits existiert
        const existingMeter = await Meter.findOne({
          beraterId,
          meterNumber
        });

        if (existingMeter) {
          results.errors.push({
            row: i + 2,
            data: row,
            error: 'Zähler existiert bereits'
          });
          results.failed++;
          continue;
        }

        // Mappe Zählerart (deutsche Namen → englische enum Werte)
        const typeMapping = {
          'Strom': 'electricity',
          'Gas': 'gas',
          'Wasser': 'water',
          'Wärmepumpe': 'heatpump',
          'Nachtspeicher': 'nightstorage'
        };

        const zaehlerart = row['Zählerart'] || 'Strom';
        const meterType = typeMapping[zaehlerart] || 'electricity';

        // Erstelle neuen Zähler
        const meterData = {
          beraterId,
          meterNumber,
          type: meterType,
          location: {
            street: row['Anschrift (Straße)'] || '',
            zip: String(row['Anschrift (Postleitzahl)'] || ''),
            city: row['Anschrift (Stadt)'] || ''
          }
        };

        console.log('Creating meter with data:', JSON.stringify(meterData, null, 2));
        const meter = await Meter.create(meterData);
        console.log('Meter created:', JSON.stringify(meter.toObject(), null, 2));

        results.imported.push(meter);
        results.success++;

      } catch (error) {
        results.errors.push({
          row: i + 2,
          data: row,
          error: error.message
        });
        results.failed++;
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Fehler beim Lesen der Excel-Datei: ${error.message}`);
  }
};
