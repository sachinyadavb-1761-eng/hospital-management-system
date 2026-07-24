// fixMissingIsDeleted.js
// Purpose: Purane User documents jinme "isDeleted" field missing hai,
// unme isDeleted: false set karta hai — taaki login query
// { email, isDeleted: false } unhe match kar sake.
//
// Run: node fixMissingIsDeleted.js  (backend folder ke andar se, jahan .env hai)

import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Un documents ko dhundo jinme isDeleted field bilkul exist nahi karta
    const result = await User.updateMany(
      { isDeleted: { $exists: false } },
      { $set: { isDeleted: false } },
    );

    console.log("═══════════════════════════════════════");
    console.log(`🔍 Matched: ${result.matchedCount}`);
    console.log(`✅ Modified: ${result.modifiedCount}`);
    console.log("═══════════════════════════════════════");

    // isActive field bhi same tarah missing ho sakta hai purane docs mein
    const result2 = await User.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } },
    );
    console.log(`🔍 isActive matched: ${result2.matchedCount}`);
    console.log(`✅ isActive modified: ${result2.modifiedCount}`);

    console.log("Done. Ab purane users login kar sakte hain.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
