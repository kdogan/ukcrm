const XLSX = require('xlsx');
const path = require('path');

// Simuliere den Import
const zaehlerPath = path.join(__dirname, '../../uploads', 'zaehler_12.xlsx');
const workbook = XLSX.readFile(zaehlerPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('=== Test Zähler Import ===\n');

// Nehme erste Zeile als Beispiel
const row = data[0];
console.log('Original Excel-Zeile:', row);
console.log('\nSpalten:');
console.log('- Zählernummer:', row['Zählernummer']);
console.log('- Zählerart:', row['Zählerart']);
console.log('- Anschrift (Straße):', row['Anschrift (Straße)']);
console.log('- Anschrift (Postleitzahl):', row['Anschrift (Postleitzahl)']);
console.log('- Anschrift (Stadt):', row['Anschrift (Stadt)']);

console.log('\n=== Was wird ins Meter-Model geschrieben: ===');
const meterData = {
  meterNumber: String(row['Zählernummer'] || '').trim(),
  type: 'nightstorage',
  location: {
    street: row['Anschrift (Straße)'] || '',
    zip: String(row['Anschrift (Postleitzahl)'] || ''),
    city: row['Anschrift (Stadt)'] || ''
  }
};

console.log(JSON.stringify(meterData, null, 2));
