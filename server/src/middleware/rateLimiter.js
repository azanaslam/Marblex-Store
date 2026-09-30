// Simple lightweight in-memory rate limiter
const ipRequests = new Map();

const cleanupInterval = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipRequests.entries()) {
    if (now - record.startTime > record.windowMs) {
      ipRequests.delete(key);
    }
  }
}, cleanupInterval);

const orderRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 10 * 60 * 1000; // 10 minutes
  const max = options.max || 30; // max 30 orders per 10 mins per IP
  const message = options.message || "Too many order requests from this IP, please try again later.";

  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown_ip";
    const now = Date.now();

    let record = ipRequests.get(ip);
    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now, windowMs };
      ipRequests.set(ip, record);
      return next();
    }

    record.count += 1;
    if (record.count > max) {
      return res.status(429).json({ message });
    }

    next();
  };
};

module.exports = { orderRateLimiter };
