import {
  BrokerMiner,
  BrokerSession,
  HashratePoint,
  MinerSession,
  Permissions,
  RewardsSummary,
  SignupResponse,
  SubAccount,
  Worker,
} from "../types/api";

const API_BASE = process.env.REACT_APP_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  minerLogin: (email: string, password: string) =>
    request<MinerSession>("/api/log_user", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  brokerLogin: (email: string, password: string) =>
    request<BrokerSession>("/api/broker/log", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  registerMiner: (email: string, password: string) =>
    request<SignupResponse>("/api/register_user", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  registerBroker: (email: string, password: string, referenceCode?: string) =>
    request<SignupResponse>("/api/register_broker", {
      method: "POST",
      body: JSON.stringify({ email, password, referenceCode }),
    }),
  checkMinerSession: () => request<MinerSession>("/api/check_auth"),
  checkBrokerSession: () => request<BrokerSession>("/api/broker/check_auth"),
  logout: () => request<{}>("/api/logout", { method: "POST" }),
  forgotPassword: (email: string) =>
    request<{}>("/api/forgot_password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (
    email: string,
    code: string,
    two_fa_token: string,
    newPassword: string
  ) =>
    request<{}>("/api/reset_password", {
      method: "POST",
      body: JSON.stringify({ email, code, two_fa_token, newPassword }),
    }),
  getHashrate: () =>
    request<{ pplns_hashrate: number; fpps_hashrate: number }>("/api/user/hashrate"),
  getHashrateHistory: (duration: number) =>
    request<HashratePoint[]>(`/api/user/hashrate/history?duration=${duration}`),
  getWorkers: (from?: string, to?: string) => {
    const query = new URLSearchParams();
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    const queryString = query.toString();
    return request<Worker[]>(`/api/workers${queryString ? `?${queryString}` : ""}`);
  },
  getPermissions: () => request<Permissions>("/api/user/permissions"),
  updateBitcoinAddress: (bitcoinAddress: string, twoFaToken: string) =>
    request<{}>("/api/bitcoin_address", {
      method: "POST",
      body: JSON.stringify({ bitcoinAddress, twoFaToken }),
    }),
  getSubAccounts: () => request<SubAccount[]>("/api/user/sub_account"),
  switchSubAccount: (currentUserToken: string, subAccountToken: string) =>
    request<MinerSession>("/api/log_subaccount", {
      method: "POST",
      body: JSON.stringify({ currentUserToken, subAccountToken }),
    }),
  createSubAccount: (sub_account: string, bitcoin_address: string) =>
    request<SubAccount>("/api/user/sub_account", {
      method: "POST",
      body: JSON.stringify({ sub_account, bitcoin_address }),
    }),
  getBrokerMiners: () => request<BrokerMiner[]>("/api/broker/miners"),
  getRewards: () => request<RewardsSummary>("/api/user/rewards"),
};
