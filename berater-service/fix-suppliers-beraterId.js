const mongoose = require('mongoose');
require('dotenv').config();

async function fixSuppliers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const Supplier = require('./src/models/Supplier');
    const User = require('./src/models/User');

    console.log('========================================');
    console.log('Fix Suppliers - Add beraterId Field');
    console.log('========================================\n');

    // Finde alle Suppliers ohne beraterId
    const suppliersWithoutBerater = await Supplier.countDocuments({
      beraterId: { $exists: false }
    });

    console.log(`Found ${suppliersWithoutBerater} suppliers without beraterId\n`);

    if (suppliersWithoutBerater === 0) {
      console.log('✓ All suppliers already have beraterId');
      console.log('No action needed.');
      await mongoose.connection.close();
      return;
    }

    // Finde einen Master Berater oder den ersten Berater
    let defaultBerater = await User.findOne({ isMasterBerater: true });

    if (!defaultBerater) {
      defaultBerater = await User.findOne({ role: 'berater' });
    }

    if (!defaultBerater) {
      defaultBerater = await User.findOne({});
    }

    if (!defaultBerater) {
      console.log('✗ ERROR: No users found in database!');
      console.log('Please create a user first.');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`Using default berater: ${defaultBerater.firstName} ${defaultBerater.lastName}`);
    console.log(`Email: ${defaultBerater.email}`);
    console.log(`ID: ${defaultBerater._id}\n`);

    // Update all suppliers without beraterId
    const result = await Supplier.updateMany(
      { beraterId: { $exists: false } },
      { $set: { beraterId: defaultBerater._id } }
    );

    console.log(`✓ Updated ${result.modifiedCount} suppliers\n`);

    // Verify
    const remaining = await Supplier.countDocuments({
      beraterId: { $exists: false }
    });

    if (remaining === 0) {
      console.log('========================================');
      console.log('✓ SUCCESS! All suppliers now have beraterId');
      console.log('========================================');
    } else {
      console.log(`⚠ Warning: ${remaining} suppliers still missing beraterId`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

fixSuppliers();
