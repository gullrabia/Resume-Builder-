import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb = async () => {
  try {
    const mongodbURI = process.env.MONGODB_URI;

    if (!mongodbURI) {
      throw new Error("MONGODB_URI environment variable not set");
    }

    await mongoose.connect(mongodbURI);

    console.log("Database is connected successfully");

    mongoose.connection.on("error", (err) => {
      console.log("MongoDB connection error:", err);
    });

  } catch (error) {
    console.log("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDb;