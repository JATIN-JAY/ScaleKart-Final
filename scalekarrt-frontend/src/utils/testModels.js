require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/database");

// Import models
const User = require("../models/User");
let Product, Order;

try {
  Product = require("../models/Product");
} catch {}
try {
  Order = require("../models/Order");
} catch {}

const testModels = async () => {
  console.log("🚀 Starting model test...");

  try {
    // Connect DB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Check models
    if (User) console.log("✅ User model loaded");
    if (Product) console.log("✅ Product model loaded");
    if (Order) console.log("✅ Order model loaded");

    // List collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    console.log("\n📦 Existing collections:", collections.map(c => c.name));

    console.log("\n✅ All models are working correctly!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
};

testModels();
