const crypto = require("crypto");
const {
  users,
  subAccountsByUser,
  brokerMiners,
  hash,
  createMinerPayload,
  createBrokerPayload,
  buildMockWorkers,
} = require("./_lib/mockData");
const { setSession, clearSession, getSession } = require("./_lib/session");

function normalizeRoute(req) {
  const queryRoute = req?.query?.route;
  if (Array.isArray(queryRoute) && queryRoute.length > 0) return `/${queryRoute.join("/")}`;
  if (typeof queryRoute === "string" && queryRoute.length > 0) return `/${queryRoute}`;

  // Fallback for environments where catch-all query params are not populated.
  const pathname = String(req.url || "").split("?")[0];
  if (pathname.startsWith("/api/")) return pathname.slice(4) || "/";
  if (pathname === "/api") return "/";
  return pathname || "/";
}

function sendJson(res, status, body) {
  res.status(status).json(body);
}

function requireRole(req, res, role) {
  const session = getSession(req);
  if (!session || session.role !== role) {
    sendJson(res, 401, { error: "unauthorized" });
    return null;
  }
  const user = users.find((item) => item.id === session.userId && item.role === role);
  if (!user) {
    sendJson(res, 401, { error: "invalid session" });
    return null;
  }
  return user;
}

module.exports = async function handler(req, res) {
  const route = normalizeRoute(req);

  if (route === "/health" && req.method === "GET") {
    return sendJson(res, 200, { ok: true, now: Date.now() });
  }

  if (route === "/register_user" && req.method === "POST") {
    const { email, password } = req.body || {};
    if (!email || !password) return sendJson(res, 400, { error: "email and password are required" });
    const normalizedEmail = String(email).toLowerCase();
    const exists = users.some((item) => item.email === normalizedEmail);
    if (exists) return sendJson(res, 409, { error: "user already exists" });
    const created = {
      id: `miner-${crypto.randomUUID()}`,
      role: "miner",
      email: normalizedEmail,
      passwordHash: hash(String(password)),
      language: "en",
      active: true,
      two_factor_secret: null,
      bitcoin_address: null,
      kycStatus: "pending",
      selling_hash_rate: false,
    };
    users.push(created);
    return sendJson(res, 201, {
      id: created.id,
      email: created.email,
      role: created.role,
      message: "Mock miner signup successful",
    });
  }

  if (route === "/register_broker" && req.method === "POST") {
    const { email, password, referenceCode } = req.body || {};
    if (!email || !password) return sendJson(res, 400, { error: "email and password are required" });
    const normalizedEmail = String(email).toLowerCase();
    const exists = users.some((item) => item.email === normalizedEmail);
    if (exists) return sendJson(res, 409, { error: "broker already exists" });
    const created = {
      id: `broker-${crypto.randomUUID()}`,
      role: "broker",
      email: normalizedEmail,
      passwordHash: hash(String(password)),
      referenceCode: referenceCode || `BRK-${normalizedEmail.split("@")[0].toUpperCase()}`,
    };
    users.push(created);
    return sendJson(res, 201, {
      id: created.id,
      email: created.email,
      role: created.role,
      referenceCode: created.referenceCode,
      message: "Mock broker signup successful",
    });
  }

  if (route === "/log_user" && req.method === "POST") {
    const { email, password } = req.body || {};
    const user = users.find(
      (item) => item.role === "miner" && item.email === String(email || "").toLowerCase()
    );
    if (!user || user.passwordHash !== hash(String(password || ""))) {
      return sendJson(res, 401, { error: "invalid credentials" });
    }
    setSession(res, { role: "miner", userId: user.id, issuedAt: Date.now() });
    return sendJson(res, 200, createMinerPayload(user));
  }

  if (route === "/broker/log" && req.method === "POST") {
    const { email, password } = req.body || {};
    const user = users.find(
      (item) => item.role === "broker" && item.email === String(email || "").toLowerCase()
    );
    if (!user || user.passwordHash !== hash(String(password || ""))) {
      return sendJson(res, 401, { error: "invalid credentials" });
    }
    setSession(res, { role: "broker", userId: user.id, issuedAt: Date.now() });
    return sendJson(res, 200, createBrokerPayload(user));
  }

  if (route === "/check_auth" && req.method === "GET") {
    const user = requireRole(req, res, "miner");
    if (!user) return;
    return sendJson(res, 200, createMinerPayload(user));
  }

  if (route === "/broker/check_auth" && req.method === "GET") {
    const user = requireRole(req, res, "broker");
    if (!user) return;
    return sendJson(res, 200, createBrokerPayload(user));
  }

  if (route === "/logout" && req.method === "POST") {
    clearSession(res);
    return sendJson(res, 200, {});
  }

  if (route === "/forgot_password" && req.method === "POST") {
    const { email } = req.body || {};
    if (!email) return sendJson(res, 400, { error: "email is required" });
    return res.status(204).end();
  }

  if (route === "/reset_password" && req.method === "POST") {
    const { email, code, two_fa_token, newPassword } = req.body || {};
    if (!email || !code || !two_fa_token || !newPassword) {
      return sendJson(res, 400, { error: "missing reset fields" });
    }
    const user = users.find((item) => item.email === String(email).toLowerCase());
    if (!user) return sendJson(res, 404, { error: "user not found" });
    user.passwordHash = hash(String(newPassword));
    return res.status(204).end();
  }

  if (route === "/user/hashrate" && req.method === "GET") {
    const user = requireRole(req, res, "miner");
    if (!user) return;
    const base = user.id === "miner-1" ? 195 * 1e12 : 95 * 1e12;
    return sendJson(res, 200, {
      pplns_hashrate: Math.round(base + Math.random() * 4 * 1e12),
      fpps_hashrate: Math.round(base * 0.35 + Math.random() * 1.5 * 1e12),
    });
  }

  if (route === "/user/hashrate/history" && req.method === "GET") {
    const user = requireRole(req, res, "miner");
    if (!user) return;
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
    return sendJson(res, 200, history);
  }

  if (route === "/workers" && req.method === "GET") {
    const user = requireRole(req, res, "miner");
    if (!user) return;
    const workers = buildMockWorkers(req.query.from, req.query.to);
    return sendJson(res, 200, workers);
  }

  if (route === "/user/rewards" && req.method === "GET") {
    const user = requireRole(req, res, "miner");
    if (!user) return;
    return sendJson(res, 200, {
      today: 0.00041,
      yesterday: 0.00039,
      profitability: 0.0000051,
      allTime: user.id === "miner-1" ? 1.3921 : 0.8122,
      history: [
        { mining_date: "2026-04-22", fee: 0.02, reward: 0.00041 },
        { mining_date: "2026-04-21", fee: 0.02, reward: 0.00039 },
        { mining_date: "2026-04-20", fee: 0.02, reward: 0.00037 },
      ],
    });
  }

  if (route === "/user/permissions" && req.method === "GET") {
    const user = requireRole(req, res, "miner");
    if (!user) return;
    return sendJson(res, 200, {
      editBtcAddress: true,
      createSubAccount: true,
      viewSubAccounts: true,
    });
  }

  if (route === "/bitcoin_address" && req.method === "POST") {
    const user = requireRole(req, res, "miner");
    if (!user) return;
    const { bitcoinAddress, twoFaToken } = req.body || {};
    if (!bitcoinAddress || !twoFaToken) {
      return sendJson(res, 400, { error: "bitcoinAddress and twoFaToken are required" });
    }
    user.bitcoin_address = String(bitcoinAddress);
    return res.status(204).end();
  }

  if (route === "/user/sub_account" && req.method === "GET") {
    const user = requireRole(req, res, "miner");
    if (!user) return;
    return sendJson(res, 200, subAccountsByUser.get(user.id) || []);
  }

  if (route === "/user/sub_account" && req.method === "POST") {
    const user = requireRole(req, res, "miner");
    if (!user) return;
    const { sub_account, bitcoin_address } = req.body || {};
    if (!sub_account || !bitcoin_address) {
      return sendJson(res, 400, { error: "sub_account and bitcoin_address are required" });
    }
    const list = subAccountsByUser.get(user.id) || [];
    const created = {
      id: `sub-${crypto.randomUUID()}`,
      sub_account: String(sub_account),
      bitcoin_address: String(bitcoin_address),
      token: `sub-token-${crypto.randomUUID()}`,
      hashrate: String(20_000_000_000 + Math.floor(Math.random() * 20_000_000_000)),
    };
    list.push(created);
    subAccountsByUser.set(user.id, list);
    return sendJson(res, 201, created);
  }

  if (route === "/log_subaccount" && req.method === "POST") {
    const user = requireRole(req, res, "miner");
    if (!user) return;
    const { subAccountToken } = req.body || {};
    const found = (subAccountsByUser.get(user.id) || []).find((item) => item.token === subAccountToken);
    if (!found) return sendJson(res, 404, { error: "sub-account not found" });
    user.bitcoin_address = found.bitcoin_address;
    return sendJson(res, 200, createMinerPayload(user));
  }

  if (route === "/broker/miners" && req.method === "GET") {
    const user = requireRole(req, res, "broker");
    if (!user) return;
    return sendJson(res, 200, brokerMiners);
  }

  return sendJson(res, 404, { error: `Route not found: ${route}` });
};
