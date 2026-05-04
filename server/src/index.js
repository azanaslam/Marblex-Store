const app = require("./app");
const { connectDatabase } = require("./config/db");
const { port } = require("./config/env");
const { seedAdmin } = require("./utils/seedAdmin");

const startServer = async () => {
  try {
    await connectDatabase();
    await seedAdmin();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
