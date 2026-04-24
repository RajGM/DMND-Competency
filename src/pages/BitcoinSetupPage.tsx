import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { useAuth } from "../auth/AuthProvider";
import { apiClient } from "../lib/apiClient";

export function BitcoinSetupPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [bitcoinAddress, setBitcoinAddress] = useState("");
  const [twoFaToken, setTwoFaToken] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");
    setSubmitting(true);
    try {
      await apiClient.updateBitcoinAddress(bitcoinAddress, twoFaToken);
      await auth.refreshMinerSession();
      navigate("/", { replace: true });
    } catch {
      setStatus("Could not save payout address. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Set Bitcoin Payout Address">
      <p className="mb-4 text-sm text-slate-500">
        First-time setup: add your Bitcoin payout address to continue to the dashboard.
      </p>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
          placeholder="Bitcoin payout address"
          value={bitcoinAddress}
          onChange={(event) => setBitcoinAddress(event.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
          placeholder="2FA code"
          value={twoFaToken}
          onChange={(event) => setTwoFaToken(event.target.value)}
          required
        />
        <button
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
        >
          {submitting ? "Saving..." : "Save and Continue"}
        </button>
      </form>
      {status && <p className="mt-3 text-sm text-red-500">{status}</p>}
    </Card>
  );
}
