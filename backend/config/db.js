const mongoose = require("mongoose");

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(` MongoDB connected: ${conn.connection.host}`);
    
    // Optional: Log DB name and environment
    console.log(` Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(" MongoDB connection error:", error.message);
    process.exit(1); // Stop the app if DB connection fails
  }
};

// Optional: Graceful shutdown on process exit
mongoose.connection.on("disconnected", () => {
  console.warn(" MongoDB disconnected.");
});

mongoose.connection.on("error", (err) => {
  console.error(" MongoDB error:", err);
});

module.exports = connectDB;
