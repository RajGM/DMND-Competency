export type UserRole = "miner" | "broker";

export interface MinerSession {
  id: string;
  email: string;
  language: string;
  active: boolean;
  two_factor_secret: string | null;
  token: string;
  bitcoin_address: string | null;
  kycStatus: string;
  selling_hash_rate: boolean;
}

export interface BrokerSession {
  id: string;
  email: string;
  referenceCode: string;
}

export interface HashratePoint {
  time: number;
  pplns_hashrate: number;
  fpps_hashrate: number;
}

export interface Worker {
  name: string;
  hashrate: number | null;
  total_shares: number | null;
  rejected_shares: number | null;
  is_connected: boolean;
  connected_at: number | null;
  fpps_hashrate: number | null;
  fpps_total_shares: number | null;
  fpps_rejected_shares: number | null;
  is_fpps: boolean | null;
}

export interface RewardRow {
  mining_date: string;
  fee: number;
  reward: number;
}

export interface Permissions {
  editBtcAddress: boolean;
  createSubAccount: boolean;
  viewSubAccounts: boolean;
}

export interface SubAccount {
  id: string;
  sub_account: string;
  bitcoin_address: string;
  token: string;
  hashrate: string;
}

export interface BrokerMiner {
  id: string;
  name: string;
  hashrate: number;
  total_work: number;
  broker_fee: number;
}
