import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../.data/db');

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

async function startLocalMongo() {
  console.log(`Starting persistent local MongoDB at port 27017 (dbPath: ${dbPath})...`);
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbPath,
      dbName: 'localwait',
      storageEngine: 'wiredTiger'
    }
  });

  console.log(`Local MongoDB running at ${mongod.getUri()}`);
  console.log('Ready for connections at mongodb://127.0.0.1:27017/localwait');

  const cleanExit = async () => {
    console.log('\nStopping local MongoDB instance...');
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', cleanExit);
  process.on('SIGTERM', cleanExit);
}

startLocalMongo().catch((err) => {
  console.error('Error starting local MongoDB:', err);
  process.exit(1);
});
