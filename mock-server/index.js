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
const subAccountsByUser = new Map([
  [
    "miner-1",
    [
      {
        id: "sub-1",
        sub_account: "alpha-rig",
        bitcoin_address: "bc1qalphaexample123456789",
        token: "sub-token-alpha",
        hashrate: "150000000000",
      },
      {
        id: "sub-2",
        sub_account: "beta-rig",
        bitcoin_address: "bc1qbetaexample123456789",
        token: "sub-token-beta",
        hashrate: "54000000000",
      },
    ],
  ],
]);

const brokerMiners = [
  { id: "m-1", name: "Acme Mining", hashrate: 320000000000, total_work: 0.0041, broker_fee: 0.02 },
  { id: "m-2", name: "North Hash Ops", hashrate: 180000000000, total_work: 0.0029, broker_fee: 0.018 },
];

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

function getMinerUser(req) {
  const session = getSession(req);
  if (!session || session.role !== "miner") {
    return null;
  }
  return users.find((item) => item.id === session.userId && item.role === "miner") || null;
}

function getBrokerUser(req) {
  const session = getSession(req);
  if (!session || session.role !== "broker") {
    return null;
  }
  return users.find((item) => item.id === session.userId && item.role === "broker") || null;
}

function buildMockWorkers() {
  return [
    {
      name: "S19-001",
      hashrate: 100.23 * 1e12,
      total_shares: 5400,
      rejected_shares: 38,
      is_connected: true,
      connected_at: Date.now() - 1000 * 60 * 50,
      fpps_hashrate: null,
      fpps_total_shares: null,
      fpps_rejected_shares: null,
      is_fpps: false,
    },
    {
      name: "S19-002",
      hashrate: 5.4 * 1e6,
      total_shares: 920,
      rejected_shares: 20,
      is_connected: false,
      connected_at: Date.now() - 1000 * 60 * 60 * 5,
      fpps_hashrate: 4.8 * 1e6,
      fpps_total_shares: 510,
      fpps_rejected_shares: 7,
      is_fpps: true,
    },
    {
      name: "S19-003",
      hashrate: 88.02 * 1e12,
      total_shares: 4800,
      rejected_shares: 30,
      is_connected: true,
      connected_at: Date.now() - 1000 * 60 * 20,
      fpps_hashrate: null,
      fpps_total_shares: null,
      fpps_rejected_shares: null,
      is_fpps: false,
    },
  ];
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

app.get("/api/broker/check_auth", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "invalid session" });
  }
  const user = users.find((item) => item.id === session.userId);
  if (!user || user.role !== "broker") {
    return res.status(401).json({ error: "invalid session role" });
  }
  return res.json(createBrokerPayload(user));
});

app.post("/api/forgot_password", (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }
  return res.status(204).send();
});

app.post("/api/reset_password", async (req, res) => {
  const { email, code, two_fa_token, newPassword } = req.body || {};
  if (!email || !code || !two_fa_token || !newPassword) {
    return res.status(400).json({ error: "missing reset fields" });
  }
  const user = users.find((item) => item.email === String(email).toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  user.passwordHash = await bcrypt.hash(String(newPassword), 10);
  return res.status(204).send();
});

app.get("/api/user/hashrate", (req, res) => {
  const user = getMinerUser(req);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const base = user.id === "miner-1" ? 195 * 1e12 : 95 * 1e12;
  return res.json({
    pplns_hashrate: Math.round(base + Math.random() * 4 * 1e12),
    fpps_hashrate: Math.round(base * 0.35 + Math.random() * 1.5 * 1e12),
  });
});

app.get("/api/user/hashrate/history", (req, res) => {
  const user = getMinerUser(req);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const duration = Number(req.query.duration || 3600);
  const points = 24;
  const stepMs = Math.max(Math.floor((duration * 1000) / points), 60_000);
  const start = Date.now() - stepMs * (points - 1);
  const base = user.id === "miner-1" ? 180 * 1e12 : 90 * 1e12;
  const history = Array.from({ length: points }).map((_, index) => {
    const drift = Math.sin(index / 4) * 2.5 * 1e12;
    return {
      time: start + index * stepMs,
      pplns_hashrate: Math.round(base + drift + Math.random() * 1e12),
      fpps_hashrate: Math.round(base * 0.4 + drift * 0.5 + Math.random() * 6e11),
    };
  });
  return res.json(history);
});

app.get("/api/workers", (req, res) => {
  const user = getMinerUser(req);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const from = req.query.from;
  const to = req.query.to;
  const workers = buildMockWorkers().map((worker) => ({
    ...worker,
    name: from && to ? `${worker.name} (${from} to ${to})` : worker.name,
  }));
  return res.json(workers);
});

app.get("/api/user/rewards", (req, res) => {
  const user = getMinerUser(req);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const summary = {
    today: 0.00041,
    yesterday: 0.00039,
    profitability: 0.0000051,
    allTime: user.id === "miner-1" ? 1.3921 : 0.8122,
    history: [
      { mining_date: "2026-04-22", fee: 0.02, reward: 0.00041 },
      { mining_date: "2026-04-21", fee: 0.02, reward: 0.00039 },
      { mining_date: "2026-04-20", fee: 0.02, reward: 0.00037 },
    ],
  };
  return res.json(summary);
});

app.get("/api/user/permissions", (req, res) => {
  const user = getMinerUser(req);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }
  return res.json({
    editBtcAddress: true,
    createSubAccount: true,
    viewSubAccounts: true,
  });
});

app.post("/api/bitcoin_address", (req, res) => {
  const user = getMinerUser(req);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { bitcoinAddress, twoFaToken } = req.body || {};
  if (!bitcoinAddress || !twoFaToken) {
    return res.status(400).json({ error: "bitcoinAddress and twoFaToken are required" });
  }
  user.bitcoin_address = String(bitcoinAddress);
  return res.status(204).send();
});

app.get("/api/user/sub_account", (req, res) => {
  const user = getMinerUser(req);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }
  return res.json(subAccountsByUser.get(user.id) || []);
});

app.post("/api/user/sub_account", (req, res) => {
  const user = getMinerUser(req);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { sub_account, bitcoin_address } = req.body || {};
  if (!sub_account || !bitcoin_address) {
    return res.status(400).json({ error: "sub_account and bitcoin_address are required" });
  }
  const list = subAccountsByUser.get(user.id) || [];
  const created = {
    id: `sub-${randomUUID()}`,
    sub_account: String(sub_account),
    bitcoin_address: String(bitcoin_address),
    token: `sub-token-${randomUUID()}`,
    hashrate: String(20_000_000_000 + Math.floor(Math.random() * 20_000_000_000)),
  };
  list.push(created);
  subAccountsByUser.set(user.id, list);
  return res.status(201).json(created);
});

app.post("/api/log_subaccount", (req, res) => {
  const user = getMinerUser(req);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { subAccountToken } = req.body || {};
  const list = subAccountsByUser.get(user.id) || [];
  const found = list.find((item) => item.token === subAccountToken);
  if (!found) {
    return res.status(404).json({ error: "sub-account not found" });
  }
  user.bitcoin_address = found.bitcoin_address;
  return res.json(createMinerPayload(user));
});

app.get("/api/broker/miners", (req, res) => {
  const broker = getBrokerUser(req);
  if (!broker) {
    return res.status(401).json({ error: "unauthorized" });
  }
  return res.json(brokerMiners);
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
