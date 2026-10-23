
import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectToMongoDB() {
  try {
    await mongoose.connect(env.MONGODB_URI);

    console.log("You successfully connected to MongoDB!");

    // Get the native MongoDB driver objects from Mongoose.
    const db = mongoose.connection.db;
    const client = mongoose.connection.getClient();

    if (!db) {
      throw new Error("MongoDB database connection is unavailable");
    }

    return {
      mongoose,
      db,
      client,
    };
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
}

// Call this only when your application terminates.
export async function disconnectFromMongoDB() {
  await mongoose.disconnect();
}
