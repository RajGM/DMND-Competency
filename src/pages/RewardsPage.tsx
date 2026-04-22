import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/Card";
import { apiClient } from "../lib/apiClient";

export function RewardsPage() {
  const rewardsQuery = useQuery({
    queryKey: ["rewards"],
    queryFn: apiClient.getRewards,
    refetchInterval: 10 * 60 * 1000,
  });

  if (rewardsQuery.isLoading) {
    return <Card title="Rewards">Loading rewards...</Card>;
  }

  if (rewardsQuery.isError || !rewardsQuery.data) {
    return <Card title="Rewards">Could not load rewards right now.</Card>;
  }

  const rewards = rewardsQuery.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Today">{rewards.today.toFixed(8)} BTC</Card>
        <Card title="Yesterday">{rewards.yesterday.toFixed(8)} BTC</Card>
        <Card title="Profitability">{rewards.profitability.toFixed(8)} BTC</Card>
        <Card title="All-Time">{rewards.allTime.toFixed(8)} BTC</Card>
      </div>
      <Card title="Reward History">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="py-2">Date</th>
              <th>Fee</th>
              <th>Reward</th>
            </tr>
          </thead>
          <tbody>
            {rewards.history.map((row) => (
              <tr key={row.mining_date} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2">{row.mining_date}</td>
                <td>{(row.fee * 100).toFixed(2)}%</td>
                <td>{row.reward.toFixed(8)} BTC</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
