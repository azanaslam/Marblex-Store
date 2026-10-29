const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Sentry = require("@sentry/node");
const apiRoutes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");
const { frontendUrl } = require("./config/env");
const { stripeWebhook } = require("./controllers/orderController");
const { getSitemap } = require("./controllers/sitemapController");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.2,
  });
}

const app = express();

const allowedOrigins = String(frontendUrl || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Trust first proxy (Render, Heroku, etc.) so rate-limit and IP detection work properly
app.set("trust proxy", 1);

// Security Headers
app.use(helmet());

// Cookie parser for httpOnly JWT authentication
app.use(cookieParser());

// General rate limiter for /api
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { message: "Too many requests from this IP, please try again later." },
});
app.use("/api", limiter);

// Stricter rate limiter for sensitive authentication & contact endpoints (10 requests per 15 min)
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", sensitiveLimiter);
app.use("/api/auth/register", sensitiveLimiter);
app.use("/api/auth/forgot-password", sensitiveLimiter);
app.use("/api/auth/verify-2fa", sensitiveLimiter);
app.use("/api/contact", sensitiveLimiter);

// Data sanitization against NoSQL query injection
// In Express 5 req.query is a getter-only property on IncomingMessage; sanitize body and params or sanitize query in-place
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) {
    try {
      mongoSanitize.sanitize(req.query);
    } catch (e) {
      // ignore getter reassign error if any
    }
  }
  next();
});

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

// Dynamic XML Sitemap
app.get("/sitemap.xml", getSitemap);

app.use("/api", apiRoutes);
app.use(errorHandler);

module.exports = app;
