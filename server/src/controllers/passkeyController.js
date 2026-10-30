const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const Passkey = require("../models/Passkey");
const User = require("../models/User");
const { createToken } = require("../utils/createToken");
const { setAuthCookie } = require("./authController");

const RP_NAME = "MARBLEX Industrial Store";
// RP ID matches host (e.g. localhost or marblex.pk or production domain)
const getRpId = (req) => {
  const host = req.hostname || "localhost";
  if (host === "127.0.0.1") return "localhost";
  return host;
};

const getOrigin = (req) => {
  return req.get("origin") || process.env.FRONTEND_URL || "http://localhost:5173";
};

/**
 * 1. Generate Passkey Registration Options (User must be logged in)
 */
const getRegistrationOptions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userPasskeys = await Passkey.find({ userId: user._id });

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: getRpId(req),
      userName: user.email,
      userDisplayName: user.name,
      attestationType: "none",
      excludeCredentials: userPasskeys.map((p) => ({
        id: p.credentialId,
        transports: p.transports,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    // Save challenge to user
    user.currentChallenge = options.challenge;
    await user.save();

    return res.json(options);
  } catch (error) {
    console.error("[Passkey Reg Options Error]", error);
    return res.status(500).json({ message: "Failed to generate passkey registration options", error: error.message });
  }
};

/**
 * 2. Verify Passkey Registration Response (User must be logged in)
 */
const verifyRegistration = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const expectedChallenge = user.currentChallenge;
    if (!expectedChallenge) {
      return res.status(400).json({ message: "No active passkey registration challenge found" });
    }

    const { body: response, friendlyName } = req.body;
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: getOrigin(req),
      expectedRPID: getRpId(req),
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ message: "Passkey verification failed" });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    await Passkey.create({
      userId: user._id,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: response.response?.transports || [],
      friendlyName: friendlyName || "Biometric Key",
    });

    user.currentChallenge = null;
    await user.save();

    return res.json({ ok: true, message: "Passkey registered successfully!" });
  } catch (error) {
    console.error("[Passkey Verify Reg Error]", error);
    return res.status(400).json({ message: "Failed to verify passkey registration", error: error.message });
  }
};

/**
 * 3. Generate Passkey Authentication Options (For Login)
 */
const getAuthenticationOptions = async (req, res) => {
  try {
    const { email } = req.body || {};
    let allowCredentials = undefined;

    if (email) {
      const user = await User.findOne({ email: String(email).trim().toLowerCase() });
      if (user) {
        const passkeys = await Passkey.find({ userId: user._id });
        if (passkeys.length) {
          allowCredentials = passkeys.map((p) => ({
            id: p.credentialId,
            transports: p.transports,
          }));
        }
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: getRpId(req),
      userVerification: "preferred",
      allowCredentials,
    });

    // Store challenge in session or cache if guest, or update user if email was given
    if (email) {
      await User.updateOne({ email: String(email).trim().toLowerCase() }, { currentChallenge: options.challenge });
    }

    return res.json(options);
  } catch (error) {
    console.error("[Passkey Auth Options Error]", error);
    return res.status(500).json({ message: "Failed to generate passkey login options", error: error.message });
  }
};

/**
 * 4. Verify Passkey Authentication Response (Logs in user, bypasses 2FA)
 */
const verifyAuthentication = async (req, res) => {
  try {
    const { response, challenge } = req.body;
    if (!response || !response.id) {
      return res.status(400).json({ message: "Credential response required" });
    }

    const passkey = await Passkey.findOne({ credentialId: response.id });
    if (!passkey) {
      return res.status(404).json({ message: "Passkey credential not found" });
    }

    const user = await User.findById(passkey.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found for this passkey" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is suspended. Please contact support." });
    }

    const expectedChallenge = challenge || user.currentChallenge;
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: getOrigin(req),
      expectedRPID: getRpId(req),
      credential: {
        id: passkey.credentialId,
        publicKey: new Uint8Array(passkey.publicKey),
        counter: passkey.counter,
        transports: passkey.transports,
      },
    });

    if (!verification.verified) {
      return res.status(400).json({ message: "Passkey authentication failed" });
    }

    // Update counter
    passkey.counter = verification.authenticationInfo.newCounter;
    await passkey.save();

    user.currentChallenge = null;
    await user.save();

    // Passkey authentication satisfies 2FA automatically
    const token = createToken({ id: user._id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    return res.json({
      message: "Passkey authentication successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAccessGranted: user.isAccessGranted !== false,
        avatarUrl: user.avatarUrl || "",
        phone: user.phone || "",
        company: user.company || "",
        city: user.city || "",
      },
    });
  } catch (error) {
    console.error("[Passkey Verify Auth Error]", error);
    return res.status(400).json({ message: "Failed to authenticate passkey", error: error.message });
  }
};

/**
 * 5. List Passkeys for current user
 */
const listUserPasskeys = async (req, res) => {
  try {
    const passkeys = await Passkey.find({ userId: req.user.id })
      .select("credentialId friendlyName deviceType createdAt")
      .lean();
    return res.json(passkeys);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch passkeys", error: error.message });
  }
};

/**
 * 6. Delete a Passkey
 */
const deletePasskey = async (req, res) => {
  try {
    const result = await Passkey.findOneAndDelete({
      credentialId: req.params.credentialId,
      userId: req.user.id,
    });
    if (!result) return res.status(404).json({ message: "Passkey not found" });
    return res.json({ ok: true, message: "Passkey removed" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete passkey", error: error.message });
  }
};

module.exports = {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
  listUserPasskeys,
  deletePasskey,
};
