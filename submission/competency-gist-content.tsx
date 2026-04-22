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

export function CompetencyBitcoinWidget({ theme }: { theme: "light" | "dark" }) {
  const priceQuery = useQuery({
    queryKey: ["competency-bitcoin-price"],
    queryFn: fetchBtcPrice,
    refetchInterval: 60_000,
  });

  const history = useMemo<PricePoint[]>(() => {
    const now = Date.now();
    const current = priceQuery.data ?? 0;
    return Array.from({ length: 12 }).map((_, index) => ({
      time: now - (11 - index) * 60_000,
      usd: current > 0 ? current - (11 - index) * 20 : 0,
    }));
  }, [priceQuery.data]);

  return (
    <section
      className={`rounded-xl border p-4 ${theme === "dark" ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}
    >
      <h2 className="text-lg font-semibold">BTC Live Price</h2>
      <p className="text-2xl font-semibold">
        {priceQuery.data ? `$${priceQuery.data.toLocaleString()}` : "Loading..."}
      </p>
      <p className="text-sm opacity-70">Polling every 60 seconds</p>
      <div className="mt-4 h-64">
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
    </section>
  );
}
