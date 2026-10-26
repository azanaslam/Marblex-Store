const PushSubscription = require("../models/PushSubscription");
const { getVapidPublicKey, isPushConfigured } = require("../utils/webPush");

const getPublicKey = async (_req, res) => {
  if (!isPushConfigured()) {
    return res.status(503).json({
      message: "Web Push not configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY on the server.",
    });
  }
  return res.json({ publicKey: getVapidPublicKey() });
};

const subscribe = async (req, res) => {
  if (!isPushConfigured()) {
    return res.status(503).json({ message: "Web Push not configured on server." });
  }

  const { endpoint, keys } = req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: "Invalid push subscription payload." });
  }

  const userId = req.user?.id || null;
  const userAgent = String(req.headers["user-agent"] || "").slice(0, 300);

  const doc = await PushSubscription.findOneAndUpdate(
    { endpoint },
    {
      endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
      user: userId,
      userAgent,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(201).json({ ok: true, id: doc._id });
};

const unsubscribe = async (req, res) => {
  const { endpoint } = req.body || {};
  if (!endpoint) return res.status(400).json({ message: "endpoint required" });

  const filter = { endpoint };
  if (req.user?.id) {
    // Allow owner or same endpoint
    await PushSubscription.deleteMany({
      endpoint,
      $or: [{ user: req.user.id }, { user: null }],
    });
  } else {
    await PushSubscription.deleteOne(filter);
  }

  return res.json({ ok: true });
};

module.exports = { getPublicKey, subscribe, unsubscribe };
