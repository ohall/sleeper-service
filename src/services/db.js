import { MongoClient, ObjectId } from "mongodb";
import logger from "../logger.js";
import { appConfigs } from "../../configs/appConfigs.js";
import { config } from "dotenv";
config();
const connectionString = process.env.MONGO_CONNECTION_STRING;
let client = null;
let db = null;

async function connect() {
  try {
    if (!db) {
      client = new MongoClient(connectionString);
      await client.connect();
      db = client.db(appConfigs.dbName);
      logger.info(`Connected to MongoDB: ${appConfigs.dbName}`);
    }
    return db;
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    throw error;
  }
}

async function disconnect() {
  try {
    if (client) {
      await client.close();
      client = null;
      db = null;
      logger.info("Disconnected from MongoDB");
    }
  } catch (error) {
    logger.error("MongoDB disconnection error:", error);
    throw error;
  }
}

async function create(collection, document) {
  try {
    const db = await connect();
    const result = await db.collection(collection).insertOne(document);
    return result;
  } catch (error) {
    logger.error("MongoDB create error:", error);
    throw error;
  }
}

async function createMany(collection, documents) {
  try {
    const db = await connect();
    const result = await db.collection(collection).insertMany(documents);
    return result;
  } catch (error) {
    logger.error("MongoDB createMany error:", error);
    throw error;
  }
}

async function findOne(collection, query) {
  try {
    const db = await connect();
    console.log(
      `findOne collection: ${collection}, query: ${JSON.stringify(query)}, db: ${db}`,
    );
    const result = await db.collection(collection).findOne(query);
    console.log(`findOne result: ${result}`);
    return result;
  } catch (error) {
    logger.error("MongoDB findOne error:", error);
    throw error;
  }
}

async function updateOne(
  collection,
  query,
  update,
  options = { upsert: true },
) {
  try {
    const db = await connect();
    const result = await db
      .collection(collection)
      .updateOne(query, update, options);
    return result;
  } catch (error) {
    logger.error("MongoDB updateOne error:", error);
    throw error;
  }
}

async function updateMany(collection, query, update) {
  try {
    const db = await connect();
    const result = await db
      .collection(collection)
      .updateMany(query, { $set: update });
    return result;
  } catch (error) {
    logger.error("MongoDB updateMany error:", error);
    throw error;
  }
}

async function deleteOne(collection, query) {
  try {
    const db = await connect();
    const result = await db.collection(collection).deleteOne(query);
    return result;
  } catch (error) {
    logger.error("MongoDB deleteOne error:", error);
    throw error;
  }
}

async function deleteMany(collection, query) {
  try {
    const db = await connect();
    const result = await db.collection(collection).deleteMany(query);
    return result;
  } catch (error) {
    logger.error("MongoDB deleteMany error:", error);
    throw error;
  }
}

export {
  connect,
  disconnect,
  create,
  createMany,
  findOne,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
  ObjectId,
};
