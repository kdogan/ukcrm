const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist/berater-ui/index.html');
const buildTime = new Date().toISOString();

fs.readFile(indexPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading index.html:', err);
    return;
  }
  
  const updated = data.replace(
    '<head>',
    `<head>\n  <!-- Build: ${buildTime} -->`
  );
  
  fs.writeFile(indexPath, updated, 'utf8', (err) => {
    if (err) console.error('Error writing index.html:', err);
    else console.log('✅ Added build version to index.html');
  });
});