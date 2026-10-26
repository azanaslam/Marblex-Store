const webpush = require("web-push");
const PushSubscription = require("../models/PushSubscription");

let configured = false;

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "";
  const subject = process.env.VAPID_SUBJECT || "mailto:Marblexpak@gmail.com";

  if (!publicKey || !privateKey) {
    configured = false;
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

function isPushConfigured() {
  if (!configured) configureWebPush();
  return configured;
}

function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || "";
}

async function sendToSubscription(subDoc, payload) {
  const subscription = {
    endpoint: subDoc.endpoint,
    keys: {
      p256dh: subDoc.keys.p256dh,
      auth: subDoc.keys.auth,
    },
  };

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (err) {
    const status = err?.statusCode || err?.status;
    // Gone / expired subscription
    if (status === 404 || status === 410) {
      await PushSubscription.deleteOne({ _id: subDoc._id }).catch(() => {});
    } else {
      console.error("web-push send failed:", status || err.message);
    }
    return false;
  }
}

/**
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {{ title: string, body: string, url?: string, tag?: string }} payload
 */
async function sendPushToUser(userId, payload) {
  if (!isPushConfigured() || !userId) return { sent: 0 };
  const subs = await PushSubscription.find({ user: userId });
  let sent = 0;
  await Promise.all(
    subs.map(async (sub) => {
      const ok = await sendToSubscription(sub, {
        title: payload.title || "MARBLEX",
        body: payload.body || "",
        url: payload.url || "/",
        tag: payload.tag || "marblex",
        icon: "/logo-icon.png",
        badge: "/marblex-mark.png",
      });
      if (ok) sent += 1;
    })
  );
  return { sent };
}

/** All staff / admin devices */
async function sendPushToStaff(payload) {
  if (!isPushConfigured()) return { sent: 0 };
  const User = require("../models/User");
  const staff = await User.find({ role: { $in: ["admin", "staff"] } }).select("_id");
  let sent = 0;
  for (const u of staff) {
    const r = await sendPushToUser(u._id, payload);
    sent += r.sent;
  }
  return { sent };
}

/** Every stored subscription (logged-in + anonymous) */
async function sendPushToAll(payload) {
  if (!isPushConfigured()) return { sent: 0 };
  const subs = await PushSubscription.find({});
  let sent = 0;
  await Promise.all(
    subs.map(async (sub) => {
      const ok = await sendToSubscription(sub, {
        title: payload.title || "MARBLEX",
        body: payload.body || "",
        url: payload.url || "/",
        tag: payload.tag || "marblex-broadcast",
        icon: "/logo-icon.png",
        badge: "/marblex-mark.png",
      });
      if (ok) sent += 1;
    })
  );
  return { sent };
}

module.exports = {
  configureWebPush,
  isPushConfigured,
  getVapidPublicKey,
  sendPushToUser,
  sendPushToStaff,
  sendPushToAll,
};
