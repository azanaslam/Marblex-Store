const BC_SEEN_IDS_KEY = "marblex_bc_seen_ids";
const BC_BOOTSTRAPPED_KEY = "marblex_bc_bootstrapped";
export const NOTIFS_CHANGED_EVENT = "marblex-notifs-changed";

export const notifyNotifsChanged = () => {
  try {
    window.dispatchEvent(new Event(NOTIFS_CHANGED_EVENT));
  } catch {}
};

const readIds = () => {
  try {
    const raw = localStorage.getItem(BC_SEEN_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const writeIds = (ids) => {
  try {
    localStorage.setItem(BC_SEEN_IDS_KEY, JSON.stringify([...new Set(ids.map(String))]));
  } catch {}
};

/** First load: treat existing broadcasts as already seen so history doesn't flood the bell. */
export const bootstrapBroadcastSeen = (broadcasts = []) => {
  try {
    if (localStorage.getItem(BC_BOOTSTRAPPED_KEY)) return;
    const ids = broadcasts.map((b) => String(b._id)).filter(Boolean);
    writeIds([...readIds(), ...ids]);
    localStorage.setItem(BC_BOOTSTRAPPED_KEY, "1");
  } catch {}
};

export const getUnseenBroadcasts = (broadcasts = []) => {
  bootstrapBroadcastSeen(broadcasts);
  const seen = new Set(readIds());
  return broadcasts.filter((b) => b?._id && !seen.has(String(b._id)));
};

export const markBroadcastSeen = (id) => {
  if (!id) return;
  writeIds([...readIds(), String(id)]);
  notifyNotifsChanged();
};

export const markAllBroadcastsSeen = (broadcasts = []) => {
  const ids = broadcasts.map((b) => String(b._id)).filter(Boolean);
  writeIds([...readIds(), ...ids]);
  notifyNotifsChanged();
};
