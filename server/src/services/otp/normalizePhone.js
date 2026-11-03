/**
 * Normalizes phone numbers (especially Pakistani numbers) into standard international E.164 format (+923XXXXXXXXX).
 */
function normalizePhone(phone = "") {
  if (!phone) return "";
  let cleaned = String(phone).trim().replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+92")) {
    cleaned = "+92" + cleaned.slice(3).replace(/^0+/, "");
  } else if (cleaned.startsWith("0092")) {
    cleaned = "+92" + cleaned.slice(4).replace(/^0+/, "");
  } else if (cleaned.startsWith("92")) {
    cleaned = "+92" + cleaned.slice(2).replace(/^0+/, "");
  } else if (cleaned.startsWith("03")) {
    cleaned = "+92" + cleaned.slice(1);
  } else if (cleaned.startsWith("3") && cleaned.length === 10) {
    cleaned = "+92" + cleaned;
  } else if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

module.exports = { normalizePhone };

