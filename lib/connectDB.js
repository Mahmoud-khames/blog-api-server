import mongoose from "mongoose";

const connectDb = async () => {
  try {
    console.log("🔄 Trying to connect to MongoDB...");

    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is missing in environment variables!");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // مهلة أقصر للاتصال
    });

    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDb;
