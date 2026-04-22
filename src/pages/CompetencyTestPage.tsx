import { useMemo } from "react";
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
import { useTheme } from "../theme/ThemeProvider";

type PricePoint = { time: number; usd: number };

async function fetchBtcPrice(): Promise<number> {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch BTC price");
  }
  const body = (await response.json()) as { bitcoin: { usd: number } };
  return body.bitcoin.usd;
}

export function CompetencyTestPage() {
  const { theme } = useTheme();
  const priceQuery = useQuery({
    queryKey: ["competency-bitcoin-price"],
    queryFn: fetchBtcPrice,
    refetchInterval: 60_000,
  });

  const history = useMemo<PricePoint[]>(() => {
    const now = Date.now();
    const current = priceQuery.data ?? 0;
    // Keep 12 sample points for chart visibility in demo.
    return Array.from({ length: 12 }).map((_, index) => ({
      time: now - (11 - index) * 60_000,
      usd: current > 0 ? current - (11 - index) * 20 : 0,
    }));
  }, [priceQuery.data]);

  return (
    <div className="space-y-6">
      <Card title="Competency Test - BTC Live Price">
        <p className="text-sm text-slate-500">
          Public API polling every 60 seconds with Recharts and theme-aware UI.
        </p>
        <p className="mt-3 text-3xl font-semibold">
          {priceQuery.data ? `$${priceQuery.data.toLocaleString()}` : "Loading..."}
        </p>
        <p className="mt-1 text-sm text-slate-500">Theme: {theme}</p>
      </Card>
      <Card title="BTC Price Trend (Demo)">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(Number(value)).toLocaleTimeString()}
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Line type="monotone" dataKey="usd" stroke="#f59e0b" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
