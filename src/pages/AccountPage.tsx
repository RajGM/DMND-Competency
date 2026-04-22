import { FormEvent, useState } from "react";
import { Card } from "../components/Card";
import { useAuth } from "../auth/AuthProvider";
import { apiClient } from "../lib/apiClient";
import { truncateMiddle } from "../lib/format";

export function AccountPage() {
  const auth = useAuth();
  const [bitcoinAddress, setBitcoinAddress] = useState("");
  const [twoFaToken, setTwoFaToken] = useState("");
  const [status, setStatus] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await apiClient.updateBitcoinAddress(bitcoinAddress, twoFaToken);
      setStatus("Bitcoin address updated.");
    } catch {
      setStatus("Address update failed.");
    }
  };

  return (
    <Card title="Account Settings">
      <div className="mb-4 space-y-1 text-sm">
        <p>Email: {auth.miner?.email ?? "-"}</p>
        <p>Current BTC Address: {truncateMiddle(auth.miner?.bitcoin_address ?? "Not set")}</p>
      </div>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
          placeholder="New bitcoin payout address"
          value={bitcoinAddress}
          onChange={(event) => setBitcoinAddress(event.target.value)}
        />
        <input
          className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
          placeholder="2FA code"
          value={twoFaToken}
          onChange={(event) => setTwoFaToken(event.target.value)}
        />
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900">
          Update Address
        </button>
      </form>
      {status && <p className="mt-3 text-sm text-slate-500">{status}</p>}
    </Card>
  );
}
