const http = require("http");
const app = require("./app");
const { connectDatabase } = require("./config/db");
const { port } = require("./config/env");
const { seedAdmin } = require("./utils/seedAdmin");
const { initSocket } = require("./socket");

const startServer = async () => {
  try {
    await connectDatabase();
    await seedAdmin();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
