import { NavLink, Outlet } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../auth/AuthProvider";

function linkClass({ isActive }: { isActive: boolean }): string {
  return `rounded-lg px-3 py-2 text-sm ${
    isActive
      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
      : "text-slate-600 dark:text-slate-300"
  }`;
}

export function AppLayout() {
  const auth = useAuth();
  const isMiner = auth.role === "miner";
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold">DMND Dashboard</div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
              onClick={auth.logout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <nav className="flex flex-col gap-1">
            {isMiner ? (
              <>
                <NavLink to="/" end className={linkClass}>
                  Home
                </NavLink>
                <NavLink to="/workers" className={linkClass}>
                  Workers
                </NavLink>
                <NavLink to="/rewards" className={linkClass}>
                  Rewards
                </NavLink>
                <NavLink to="/competency-test" className={linkClass}>
                  Competency Test
                </NavLink>
                {auth.permissions?.viewSubAccounts && (
                  <NavLink to="/sub-accounts" className={linkClass}>
                    Sub-Accounts
                  </NavLink>
                )}
                {auth.permissions?.editBtcAddress && (
                  <NavLink to="/account" className={linkClass}>
                    Account
                  </NavLink>
                )}
              </>
            ) : (
              <NavLink to="/broker-dashboard" className={linkClass}>
                Broker Dashboard
              </NavLink>
            )}
          </nav>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
