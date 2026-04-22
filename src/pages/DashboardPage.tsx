import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../components/Card";
import { apiClient } from "../lib/apiClient";
import { formatHashrate } from "../lib/format";

const POLL_5_MIN = 5 * 60 * 1000;

export function DashboardPage() {
  const hashrateQuery = useQuery({
    queryKey: ["hashrate-live"],
    queryFn: apiClient.getHashrate,
    refetchInterval: POLL_5_MIN,
  });

  const historyQuery = useQuery({
    queryKey: ["hashrate-history", 21600],
    queryFn: () => apiClient.getHashrateHistory(21600),
    refetchInterval: POLL_5_MIN,
  });

  const live = hashrateQuery.data;
  const hasAnyHashrate = Boolean((live?.pplns_hashrate ?? 0) + (live?.fpps_hashrate ?? 0));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Live PPLNS Hashrate">
          <p className="text-2xl font-semibold">{formatHashrate(live?.pplns_hashrate ?? null)}</p>
        </Card>
        <Card title="Live FPPS Hashrate">
          <p className="text-2xl font-semibold">{formatHashrate(live?.fpps_hashrate ?? null)}</p>
        </Card>
      </div>
      {!hashrateQuery.isLoading && !hasAnyHashrate && (
        <Card title="Welcome">
          <p className="text-sm text-slate-500">
            No mining data yet. Connect your workers to start seeing live hashrate updates.
          </p>
        </Card>
      )}

      <Card title="Connection Info">
        <p className="text-sm text-slate-500">URL: stratum+tcp://pool.dmnd.local</p>
        <p className="text-sm text-slate-500">Username: your-account.worker</p>
        <p className="text-sm text-slate-500">Password: x</p>
      </Card>

      <Card title="Hashrate History (6h)">
        {historyQuery.isError && (
          <p className="mb-3 text-sm text-red-500">Could not load hashrate history right now.</p>
        )}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyQuery.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                minTickGap={28}
              />
              <YAxis tickFormatter={(value) => formatHashrate(value)} />
              <Tooltip
                labelFormatter={(value) => new Date(Number(value)).toLocaleString()}
                formatter={(value) =>
                  formatHashrate(typeof value === "number" ? value : Number(value))
                }
              />
              <Line type="monotone" dataKey="pplns_hashrate" stroke="#3b82f6" dot={false} />
              <Line type="monotone" dataKey="fpps_hashrate" stroke="#22c55e" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
