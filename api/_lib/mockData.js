const crypto = require("crypto");

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

const users = [
  {
    id: "miner-1",
    role: "miner",
    email: "miner@dmnd.local",
    passwordHash: hash("miner123"),
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
    passwordHash: hash("broker123"),
    referenceCode: "BRK-DMND-001",
  },
];

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

function buildMockWorkers(from, to) {
  const dateSuffix = from && to ? ` (${from} to ${to})` : "";
  return [
    {
      name: `S19-001${dateSuffix}`,
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
      name: `S19-002${dateSuffix}`,
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
      name: `S19-003${dateSuffix}`,
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

module.exports = {
  users,
  subAccountsByUser,
  brokerMiners,
  hash,
  createMinerPayload,
  createBrokerPayload,
  buildMockWorkers,
};
