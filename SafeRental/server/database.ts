import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    
    // Extract database name from URI or use default
    const dbName = uri.split('/').pop()?.split('?')[0] || 'saferental';
    db = client.db(dbName);
    
    console.log(`✅ Connected to MongoDB Atlas: ${dbName}`);
    
    // Set up indexes for performance and constraints
    await ensureIndexes();
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

async function ensureIndexes() {
  try {
    console.log('🔧 Setting up database indexes...');
    
    // Agreement indexes
    await db.collection('agreements').createIndex({ agreementNumber: 1 }, { unique: true });
    await db.collection('agreements').createIndex({ tenantEmail: 1 });
    await db.collection('agreements').createIndex({ landlordEmail: 1 });
    await db.collection('agreements').createIndex({ createdAt: -1 });
    
    // OTP indexes
    await db.collection('otpVerifications').createIndex({ agreementId: 1 });
    await db.collection('otpVerifications').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
    await db.collection('otpVerifications').createIndex({ 
      agreementId: 1, 
      contactInfo: 1, 
      userType: 1 
    });
    
    // User indexes
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    
    // Counter collection for atomic agreement number generation
    // _id field is already unique in MongoDB, so no need to specify unique constraint
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('⚠️  Error creating indexes:', error);
    // Don't throw - indexes might already exist
  }
}

export async function getDatabase(): Promise<Db> {
  if (!db) {
    return await connectToDatabase();
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    console.log('📄 MongoDB connection closed');
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (!db) {
      await connectToDatabase();
    }
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}