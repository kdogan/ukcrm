const { MongoClient } = require('mongodb');
require('dotenv').config();

async function setupReplicaSet() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/berater-eskapp';

  console.log('========================================');
  console.log('MongoDB Replica Set Initialization');
  console.log('========================================\n');

  console.log('Connecting to MongoDB:', uri);

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    directConnection: true
  });

  try {
    await client.connect();
    console.log('✓ Connected to MongoDB\n');

    const admin = client.db().admin();

    // Check if already a replica set
    try {
      const status = await admin.command({ replSetGetStatus: 1 });
      console.log('✓ MongoDB is already running as a replica set');
      console.log('  Set name:', status.set);
      console.log('  State:', status.myState === 1 ? 'PRIMARY ✓' : status.myState === 2 ? 'SECONDARY' : 'OTHER');
      console.log('  Members:', status.members.length);
      console.log('\n✓ Replica set is ready! Transactions are enabled.');
      return;
    } catch (error) {
      if (error.codeName !== 'NotYetInitialized') {
        console.log('✗ MongoDB is running standalone (not a replica set)');
        console.log('\nTo enable transactions, you need to configure MongoDB as a replica set.');
        console.log('\nRun this PowerShell script as Administrator:');
        console.log('  .\\setup-mongodb-replicaset.ps1');
        console.log('\nOr manually:');
        console.log('1. Stop MongoDB service');
        console.log('2. Edit mongod.cfg (C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.cfg)');
        console.log('3. Add these lines:');
        console.log('   replication:');
        console.log('     replSetName: "rs0"');
        console.log('4. Restart MongoDB service');
        console.log('5. Run this script again');
        return;
      }

      // Replica set is configured but not initialized
      console.log('✓ MongoDB is configured for replica set but not initialized');
      console.log('\nInitializing replica set...');

      try {
        await admin.command({
          replSetInitiate: {
            _id: 'rs0',
            members: [{ _id: 0, host: 'localhost:27017' }]
          }
        });
        console.log('✓ Replica set initiated successfully!\n');

        console.log('Waiting for replica set to stabilize...');

        // Wait for replica set to become PRIMARY
        let isPrimary = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isPrimary && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;

          try {
            const status = await admin.command({ replSetGetStatus: 1 });
            if (status.myState === 1) {
              isPrimary = true;
              console.log('✓ Replica set is now PRIMARY');
              console.log('  Set name:', status.set);
              console.log('  Members:', status.members.length);
            } else {
              process.stdout.write('.');
            }
          } catch (e) {
            process.stdout.write('.');
          }
        }

        if (isPrimary) {
          console.log('\n\n========================================');
          console.log('✓ SUCCESS! MongoDB is now configured for transactions!');
          console.log('========================================\n');
          console.log('You can now run your application with transaction support.');
        } else {
          console.log('\n\n⚠ Replica set initialized but not yet PRIMARY');
          console.log('Please wait a few more seconds and restart your application.');
        }

      } catch (initError) {
        if (initError.codeName === 'AlreadyInitialized') {
          console.log('✓ Replica set already initialized');
        } else {
          throw initError;
        }
      }
    }
  } catch (error) {
    console.error('\n✗ Error:', error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\nMongoDB is not running. Please start MongoDB service:');
      console.log('1. Press Win + R');
      console.log('2. Type "services.msc" and press Enter');
      console.log('3. Find "MongoDB Server" and click Start');
    } else {
      console.log('\nPlease check:');
      console.log('1. MongoDB service is running');
      console.log('2. mongod.cfg has replication configuration');
      console.log('3. MongoDB was restarted after config change');
    }
  } finally {
    await client.close();
  }
}

setupReplicaSet();
