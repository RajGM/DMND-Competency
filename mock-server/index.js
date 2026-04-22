const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");

const app = express();
const PORT = process.env.MOCK_API_PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const SESSION_COOKIE = "dmnd_mock_sid";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const now = Date.now();

const users = [
  {
    id: "miner-1",
    role: "miner",
    email: "miner@dmnd.local",
    passwordHash: bcrypt.hashSync("miner123", 10),
    language: "en",
    active: true,
    two_factor_secret: null,
    bitcoin_address: "bc1qexamplemineraddress1234567890",
    kycStatus: "approved",
    selling_hash_rate: false,
  },
  {
    id: "broker-1",
    role: "broker",
    email: "broker@dmnd.local",
    passwordHash: bcrypt.hashSync("broker123", 10),
    referenceCode: "BRK-DMND-001",
  },
];

const sessions = new Map();

function createMinerPayload(user) {
  return {
    id: user.id,
    email: user.email,
    language: user.language || "en",
    active: true,
    two_factor_secret: user.two_factor_secret ?? null,
    token: `mock-token-${user.id}`,
    bitcoin_address: user.bitcoin_address ?? null,
    kycStatus: user.kycStatus ?? "pending",
    selling_hash_rate: Boolean(user.selling_hash_rate),
  };
}

function createBrokerPayload(user) {
  return {
    id: user.id,
    email: user.email,
    referenceCode: user.referenceCode || "BRK-MOCK",
  };
}

function setSessionCookie(res, sessionId) {
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
  });
}

function getSession(req) {
  const sid = req.cookies[SESSION_COOKIE];
  if (!sid) return null;
  return sessions.get(sid) || null;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, now });
});

app.post("/api/register_user", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const exists = users.some((user) => user.email.toLowerCase() === String(email).toLowerCase());
  if (exists) {
    return res.status(409).json({ error: "user already exists" });
  }

  const newUser = {
    id: `miner-${randomUUID()}`,
    role: "miner",
    email: String(email).toLowerCase(),
    passwordHash: await bcrypt.hash(String(password), 10),
    language: "en",
    active: true,
    two_factor_secret: null,
    bitcoin_address: null,
    kycStatus: "pending",
    selling_hash_rate: false,
  };
  users.push(newUser);

  return res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    message: "Mock miner signup successful",
  });
});

app.post("/api/register_broker", async (req, res) => {
  const { email, password, referenceCode } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const exists = users.some((user) => user.email.toLowerCase() === String(email).toLowerCase());
  if (exists) {
    return res.status(409).json({ error: "broker already exists" });
  }

  const newBroker = {
    id: `broker-${randomUUID()}`,
    role: "broker",
    email: String(email).toLowerCase(),
    passwordHash: await bcrypt.hash(String(password), 10),
    referenceCode: referenceCode || `BRK-${String(email).split("@")[0].toUpperCase()}`,
  };
  users.push(newBroker);

  return res.status(201).json({
    id: newBroker.id,
    email: newBroker.email,
    role: newBroker.role,
    referenceCode: newBroker.referenceCode,
    message: "Mock broker signup successful",
  });
});

app.post("/api/log_user", async (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((item) => item.role === "miner" && item.email === String(email).toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  const isMatch = await bcrypt.compare(String(password || ""), user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const sessionId = randomUUID();
  sessions.set(sessionId, { role: "miner", userId: user.id, createdAt: Date.now() });
  setSessionCookie(res, sessionId);
  return res.json(createMinerPayload(user));
});

app.post("/api/broker/log", async (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((item) => item.role === "broker" && item.email === String(email).toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  const isMatch = await bcrypt.compare(String(password || ""), user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const sessionId = randomUUID();
  sessions.set(sessionId, { role: "broker", userId: user.id, createdAt: Date.now() });
  setSessionCookie(res, sessionId);
  return res.json(createBrokerPayload(user));
});

app.get("/api/check_auth", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "invalid session" });
  }
  const user = users.find((item) => item.id === session.userId);
  if (!user || user.role !== "miner") {
    return res.status(401).json({ error: "invalid session role" });
  }
  return res.json(createMinerPayload(user));
});

app.post("/api/logout", (req, res) => {
  const sid = req.cookies[SESSION_COOKIE];
  if (sid) {
    sessions.delete(sid);
    res.clearCookie(SESSION_COOKIE);
  }
  return res.json({});
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Mock API listening on http://localhost:${PORT}`);
});
