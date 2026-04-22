import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/apiClient";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");
    try {
      const result = await apiClient.registerMiner(email, password);
      setStatus(result.message);
    } catch {
      setStatus("Signup failed. Try a different email.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <h1 className="text-xl font-semibold">Miner Signup (Mock)</h1>
        <p className="mt-1 text-sm text-slate-500">Temporary demo endpoint for competency test</p>
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-white dark:bg-slate-100 dark:text-slate-900">
          Create Account
        </button>
        {status && <p className="mt-3 text-sm text-slate-500">{status}</p>}
        <Link to="/login" className="mt-3 inline-block text-sm text-blue-500">
          Back to login
        </Link>
      </form>
    </div>
  );
}
