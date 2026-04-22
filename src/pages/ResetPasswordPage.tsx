import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/apiClient";

export function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [twoFa, setTwoFa] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await apiClient.resetPassword(email, code, twoFa, newPassword);
      setStatus("Password reset complete.");
    } catch {
      setStatus("Password reset failed.");
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-xl font-semibold">Reset Password</h1>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
          placeholder="Reset code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <input
          className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
          placeholder="2FA code"
          value={twoFa}
          onChange={(event) => setTwoFa(event.target.value)}
        />
        <input
          type="password"
          className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
          placeholder="New password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <button className="w-full rounded-lg bg-slate-900 py-2 text-white dark:bg-slate-100 dark:text-slate-900">
          Reset Password
        </button>
      </form>
      {status && <p className="mt-3 text-sm text-slate-500">{status}</p>}
      <Link to="/login" className="mt-3 inline-block text-sm text-blue-500">
        Back to login
      </Link>
    </div>
  );
}
