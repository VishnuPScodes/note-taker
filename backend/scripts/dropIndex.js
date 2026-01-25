import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropOldIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.collection('folders');
    
    // List existing indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Check for the old index
    const hasOldIndex = indexes.some(idx => idx.name === 'userId_1_name_1');

    if (hasOldIndex) {
      console.log('Found old index userId_1_name_1. Dropping it...');
      await collection.dropIndex('userId_1_name_1');
      console.log('Old index dropped successfully.');
    } else {
      console.log('Old index userId_1_name_1 not found or already dropped.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error dropping index:', error);
    process.exit(1);
  }
};

dropOldIndex();
