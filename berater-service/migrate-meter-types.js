const mongoose = require('mongoose');
require('dotenv').config();

async function migrateMeterTypes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const db = mongoose.connection.db;
    const collection = db.collection('meters');

    console.log('========================================');
    console.log('Meter Type Migration');
    console.log('========================================\n');

    // 1. Zeige aktuelle Zählertypen
    console.log('Current meter types:');
    const currentTypes = await collection.distinct('type');
    console.log('  Types found:', currentTypes.join(', '));

    // 2. Zähle wie viele Zähler vom Typ "heat" existieren
    const heatCount = await collection.countDocuments({ type: 'heat' });
    console.log(`\nFound ${heatCount} meter(s) with type "heat"`);

    if (heatCount > 0) {
      // 3. Ändere alle "heat" Zähler zu "heatpump"
      console.log('\nUpdating "heat" to "heatpump"...');
      const result = await collection.updateMany(
        { type: 'heat' },
        { $set: { type: 'heatpump' } }
      );
      console.log(`✓ Updated ${result.modifiedCount} meter(s)`);
    } else {
      console.log('  (No meters with type "heat" found)');
    }

    // 4. Zeige neue Zählertypen
    console.log('\nNew meter types:');
    const newTypes = await collection.distinct('type');
    newTypes.forEach(type => {
      console.log(`  - ${type}`);
    });

    console.log('\n========================================');
    console.log('✓ Migration complete!');
    console.log('========================================');
    console.log('\nMeter type changes:');
    console.log('  - "heat" → "heatpump" (Wärme → Wärmepumpe)');
    console.log('  - New type available: "nightstorage" (Nachtspeicher)\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateMeterTypes();
