const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { adminEmail, adminPassword } = require("../config/env");

const seedAdmin = async () => {
  const normalizedEmail = adminEmail.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.role = "admin";
    existing.isAccessGranted = true;
    await existing.save();
    return;
  }

  await User.create({
    name: "Admin",
    email: normalizedEmail,
    passwordHash,
    role: "admin",
    isAccessGranted: true,
  });
  console.log(`Seed admin created: ${adminEmail}`);
};

module.exports = { seedAdmin };
