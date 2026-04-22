import { Card } from "../components/Card";

const rewards = {
  today: 0.00041,
  yesterday: 0.00039,
  profitability: 0.0000051,
  allTime: 1.3921,
};

const history = [
  { mining_date: "2026-04-20", fee: 0.02, reward: 0.00041 },
  { mining_date: "2026-04-19", fee: 0.02, reward: 0.00039 },
  { mining_date: "2026-04-18", fee: 0.02, reward: 0.00037 },
];

export function RewardsPage() {
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
            {history.map((row) => (
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
