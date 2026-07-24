// fixAdminRole.js
// Purpose: Jo purane users "admin" role ke saath bane the (naya system split se pehle),
// unko "superadmin" role mein convert karta hai — taaki naya authorizeRoles
// ("superadmin", "departmentadmin") unhe match kar sake.
//
// Run: node fixAdminRole.js  (backend folder ke andar se, jahan .env hai)

import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Pehle dikhao kaun kaun se users "admin" role ke hain
    const adminUsers = await User.find({ role: "admin" }).select(
      "name email role",
    );

    console.log("═══════════════════════════════════════");
    console.log(`Found ${adminUsers.length} user(s) with role "admin":`);
    console.table(
      adminUsers.map((u) => ({ name: u.name, email: u.email, role: u.role })),
    );

    if (adminUsers.length === 0) {
      console.log(
        "Koi bhi user 'admin' role ke saath nahi mila. Kuch karne ki zaroorat nahi.",
      );
    } else {
      const result = await User.updateMany(
        { role: "admin" },
        { $set: { role: "superadmin" } },
      );
      console.log("═══════════════════════════════════════");
      console.log(
        `✅ Modified: ${result.modifiedCount} user(s) → role set to "superadmin"`,
      );
    }

    console.log("═══════════════════════════════════════");
    console.log("Done. Ab admin login 'superadmin' role se try karo.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
