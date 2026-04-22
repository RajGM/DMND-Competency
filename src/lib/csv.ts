import { Worker } from "../types/api";
import { formatHashrate } from "./format";

export function exportWorkersCsv(rows: Worker[], from: string, to: string): void {
  const headers = [
    "name",
    "hashrate",
    "total_shares",
    "rejected_shares",
    "reject_percentage",
    "status",
    "mode",
  ];

  const body = rows.map((worker) => {
    const rejectPct =
      worker.total_shares && worker.rejected_shares
        ? ((worker.rejected_shares / worker.total_shares) * 100).toFixed(2)
        : "0.00";

    return [
      worker.name,
      formatHashrate(worker.hashrate),
      String(worker.total_shares ?? 0),
      String(worker.rejected_shares ?? 0),
      `${rejectPct}%`,
      worker.is_connected ? "online" : "offline",
      worker.is_fpps ? "FPPS" : "PPLNS",
    ];
  });

  const csv = [headers, ...body].map((line) => line.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `workers-${from}-to-${to}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
