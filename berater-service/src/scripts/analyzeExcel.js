const XLSX = require('xlsx');
const path = require('path');

// Analysiere Kunden-Excel
console.log('=== Analysiere Kunden Excel ===');
const kundenPath = path.join(__dirname, '../../uploads/kunden 2345.xlsx');
const kundenWorkbook = XLSX.readFile(kundenPath);
const kundenSheetName = kundenWorkbook.SheetNames[0];
const kundenSheet = kundenWorkbook.Sheets[kundenSheetName];
const kundenData = XLSX.utils.sheet_to_json(kundenSheet);

console.log('Sheet Name:', kundenSheetName);
console.log('Anzahl Zeilen:', kundenData.length);
console.log('Erste Zeile:', kundenData[0]);
console.log('Spalten:', Object.keys(kundenData[0]));
console.log('\n');

// Analysiere Zähler-Excel
console.log('=== Analysiere Zähler Excel ===');
const zaehlerPath = path.join(__dirname, '../../uploads', 'zaehler_12.xlsx');
const zaehlerWorkbook = XLSX.readFile(zaehlerPath);
const zaehlerSheetName = zaehlerWorkbook.SheetNames[0];
const zaehlerSheet = zaehlerWorkbook.Sheets[zaehlerSheetName];
const zaehlerData = XLSX.utils.sheet_to_json(zaehlerSheet);

console.log('Sheet Name:', zaehlerSheetName);
console.log('Anzahl Zeilen:', zaehlerData.length);
console.log('Erste Zeile:', zaehlerData[0]);
console.log('Spalten:', Object.keys(zaehlerData[0]));
console.log('\nErste 3 Zeilen:');
zaehlerData.slice(0, 3).forEach((row, index) => {
  console.log(`Zeile ${index + 1}:`, row);
});
