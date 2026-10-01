import mongoose from "mongoose";

/** Connects to MongoDB. MONGO_DB_NAME lets several apps share one Atlas cluster. */
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME || "save-lives",
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`MongoDB connected (database: ${mongoose.connection.name})`);
};

export default connectDB;
