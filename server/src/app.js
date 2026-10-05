const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");
const { frontendUrl } = require("./config/env");
const { stripeWebhook } = require("./controllers/orderController");

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

// Stripe webhook MUST receive the raw body (before express.json)
app.post(
  "/api/orders/stripe-webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api", apiRoutes);
app.use(errorHandler);

module.exports = app;
