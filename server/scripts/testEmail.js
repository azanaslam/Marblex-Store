/**
 * MARBLEX Email Dispatcher Test Utility
 * Usage: node scripts/testEmail.js [target@email.com]
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
require("dotenv").config({ path: require("path").resolve(__dirname, "../src/.env") });
const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const { send2FACodeEmail } = require("../src/utils/sendEmail");

const runTest = async () => {
  const targetEmail = process.argv[2] || process.env.ADMIN_EMAIL || "azanaslam907@gmail.com";
  console.log(`\n========================================`);
  console.log(`🚀 Dispatching MARBLEX Test Email to: ${targetEmail}`);
  console.log(`========================================\n`);

  try {
    const result = await send2FACodeEmail(
      targetEmail,
      "998877",
      "Azzan Aslam",
      "System Email Delivery Test"
    );

    console.log("✅ Result:", result);
    process.exit(0);
  } catch (err) {
    console.error("❌ Test Failed:", err.message);
    process.exit(1);
  }
};

runTest();
