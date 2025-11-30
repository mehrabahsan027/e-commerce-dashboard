const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("e-commerce-dashboard");
    
    // Create indexes
    await db.collection("users").createIndex({ lastLogin: -1 });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("products").createIndex({ category: 1 });
    await db.collection("products").createIndex({ stock: 1 });
    await db.collection("orders").createIndex({ orderDate: -1 });
    
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
    return db;
  } catch (error) {
    console.error("Database connection error:", error);
    // Instead of process.exit(1), throw error for serverless compatibility
    throw error;
  }
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };