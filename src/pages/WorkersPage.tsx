import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/Card";
import { apiClient } from "../lib/apiClient";
import { exportWorkersCsv } from "../lib/csv";
import { formatHashrate } from "../lib/format";

export function WorkersPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const workersQuery = useQuery({
    queryKey: ["workers", from, to],
    queryFn: () => apiClient.getWorkers(from || undefined, to || undefined),
    refetchInterval: 5 * 60 * 1000,
  });

  const rows = useMemo(() => workersQuery.data ?? [], [workersQuery.data]);

  return (
    <Card title="Workers">
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
        />
        <input
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
        />
        <button
          onClick={() => exportWorkersCsv(rows, from || "all", to || "all")}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        {workersQuery.isLoading && <p className="mb-2 text-sm text-slate-500">Loading workers...</p>}
        {workersQuery.isError && (
          <p className="mb-2 text-sm text-red-500">Could not load workers. Try again.</p>
        )}
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="py-2">Name</th>
              <th>Hashrate</th>
              <th>24h Shares</th>
              <th>Reject %</th>
              <th>Status</th>
              <th>Mode</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((worker) => {
              const rejectPct =
                worker.total_shares && worker.rejected_shares
                  ? (worker.rejected_shares / worker.total_shares) * 100
                  : 0;
              return (
                <tr
                  key={worker.name}
                  className={`border-b border-slate-100 dark:border-slate-800 ${
                    worker.is_connected ? "" : "bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <td className="py-2">{worker.name}</td>
                  <td>{formatHashrate(worker.hashrate)}</td>
                  <td>{worker.total_shares ?? 0}</td>
                  <td>{rejectPct.toFixed(2)}%</td>
                  <td>{worker.is_connected ? "Online" : "Offline"}</td>
                  <td>{worker.is_fpps ? "FPPS" : "PPLNS"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
