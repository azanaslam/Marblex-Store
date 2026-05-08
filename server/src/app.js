const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");
const { frontendUrl } = require("./config/env");

const app = express();

const allowedOrigins = String(frontendUrl || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser clients (no origin) and same-origin
      if (!origin) return cb(null, true);
      if (!allowedOrigins.length) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use("/api", apiRoutes);
app.use(errorHandler);

module.exports = app;
