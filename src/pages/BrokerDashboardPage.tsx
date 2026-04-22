import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/Card";
import { apiClient } from "../lib/apiClient";
import { formatHashrate } from "../lib/format";

export function BrokerDashboardPage() {
  const minersQuery = useQuery({
    queryKey: ["broker-miners"],
    queryFn: apiClient.getBrokerMiners,
    refetchInterval: 5 * 60 * 1000,
  });

  return (
    <Card title="Broker Dashboard">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="py-2">Miner</th>
            <th>Hashrate</th>
            <th>Estimated Earnings</th>
            <th>Broker Fee</th>
          </tr>
        </thead>
        <tbody>
          {(minersQuery.data ?? []).map((miner) => (
            <tr key={miner.id} className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-2">{miner.name}</td>
              <td>{formatHashrate(miner.hashrate)}</td>
              <td>{miner.total_work.toFixed(8)} BTC</td>
              <td>{(miner.broker_fee * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
