const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { adminEmail, adminPassword } = require("../config/env");

const seedAdmin = async () => {
  const existing = await User.findOne({ email: adminEmail });
  if (existing) return;

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: "Admin",
    email: adminEmail,
    passwordHash,
    role: "admin",
    isAccessGranted: true,
  });
  console.log(`Seed admin created: ${adminEmail}`);
};

module.exports = { seedAdmin };
