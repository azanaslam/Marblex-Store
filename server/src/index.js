const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const http = require("http");
const app = require("./app");
const { connectDatabase } = require("./config/db");
const { port } = require("./config/env");
const { seedAdmin } = require("./utils/seedAdmin");
const { seedProducts } = require("./utils/seedProducts");
const { seedClientReviews } = require("./utils/seedClientReviews");
const { initSocket } = require("./socket");

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDatabase();
    await seedAdmin();
    await seedProducts();
    await seedClientReviews();

    const server = http.createServer(app);
    initSocket(server);

    const serverInstance = server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! Shutting down...");
      console.error(err.name, err.message);
      serverInstance.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
