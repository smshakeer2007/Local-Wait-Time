import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer = null;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`MongoDB connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`Standard MongoDB connection to ${env.MONGODB_URI} failed: ${err.message}`);
    console.log('Falling back to local MongoMemoryServer instance...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'localwait'
        }
      });
      const uri = memoryServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`In-memory MongoDB connected: ${uri}`);
      return conn;
    } catch (memErr) {
      console.error('All MongoDB connection attempts failed:', memErr.message);
      throw err;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err.message);
  }
};
