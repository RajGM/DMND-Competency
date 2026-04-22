import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/apiClient";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await apiClient.forgotPassword(email);
      setStatus("Reset code sent successfully.");
    } catch {
      setStatus("Could not send reset code.");
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-xl font-semibold">Forgot Password</h1>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button className="w-full rounded-lg bg-slate-900 py-2 text-white dark:bg-slate-100 dark:text-slate-900">
          Send Reset Code
        </button>
      </form>
      {status && <p className="mt-3 text-sm text-slate-500">{status}</p>}
      <Link to="/reset-password" className="mt-3 inline-block text-sm text-blue-500">
        Go to reset form
      </Link>
    </div>
  );
}
