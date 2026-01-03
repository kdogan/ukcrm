const mongoose = require('mongoose');
require('dotenv').config();

async function migrateContractIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const db = mongoose.connection.db;
    const collection = db.collection('contracts');

    console.log('========================================');
    console.log('Contract Index Migration');
    console.log('========================================\n');

    // 1. Zeige aktuelle Indizes
    console.log('Current indexes:');
    const currentIndexes = await collection.indexes();
    currentIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    // 2. Lösche den alten unique Index auf contractNumber
    console.log('\nDropping old contractNumber index...');
    try {
      await collection.dropIndex('contractNumber_1');
      console.log('✓ Dropped contractNumber_1');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('  (Index contractNumber_1 not found, skipping)');
      } else {
        throw error;
      }
    }

    // 3. Erstelle neuen compound unique Index
    console.log('\nCreating new compound unique index (beraterId + contractNumber)...');
    await collection.createIndex(
      { beraterId: 1, contractNumber: 1 },
      { unique: true, name: 'beraterId_1_contractNumber_1' }
    );
    console.log('✓ Created beraterId_1_contractNumber_1');

    // 4. Zeige neue Indizes
    console.log('\nNew indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key), idx.unique ? '(unique)' : '');
    });

    console.log('\n========================================');
    console.log('✓ Migration complete!');
    console.log('========================================');
    console.log('\nNow each Berater can have their own contract numbering sequence.');
    console.log('Contract numbers are unique per Berater, not globally.\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateContractIndexes();
