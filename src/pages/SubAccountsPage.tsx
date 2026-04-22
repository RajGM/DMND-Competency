import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/Card";
import { useAuth } from "../auth/AuthProvider";
import { apiClient } from "../lib/apiClient";
import { formatHashrate, truncateMiddle } from "../lib/format";

export function SubAccountsPage() {
  const auth = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");

  const subAccountsQuery = useQuery({
    queryKey: ["sub-accounts"],
    queryFn: apiClient.getSubAccounts,
  });

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");
    try {
      await apiClient.createSubAccount(name, address);
      await subAccountsQuery.refetch();
      setName("");
      setAddress("");
      setStatus("Sub-account created.");
    } catch {
      setStatus("Could not create sub-account.");
    }
  };

  const onSwitch = async (subToken: string) => {
    if (!auth.miner?.token) return;
    setStatus("");
    try {
      await apiClient.switchSubAccount(auth.miner.token, subToken);
      setStatus("Switched sub-account session.");
    } catch {
      setStatus("Switch failed.");
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Sub-Accounts">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="py-2">Name</th>
              <th>BTC Address</th>
              <th>Hashrate</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(subAccountsQuery.data ?? []).map((sub) => (
              <tr key={sub.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2">{sub.sub_account}</td>
                <td>{truncateMiddle(sub.bitcoin_address)}</td>
                <td>{formatHashrate(Number(sub.hashrate) || null)}</td>
                <td>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1 dark:border-slate-700"
                    onClick={() => onSwitch(sub.token)}
                  >
                    Switch
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {auth.permissions?.createSubAccount && (
        <Card title="Create Sub-Account">
          <form className="space-y-3" onSubmit={onCreate}>
            <input
              className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
              placeholder="Sub-account name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
              placeholder="Bitcoin payout address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900">
              Create
            </button>
          </form>
        </Card>
      )}
      {status && <p className="text-sm text-slate-500">{status}</p>}
    </div>
  );
}
