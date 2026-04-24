import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { UserRole } from "../types/api";

export function AuthGate({ children }: { children: React.ReactElement }) {
  const { role, checking } = useAuth();
  if (checking) {
    return <div className="p-6 text-sm text-slate-500">Checking session...</div>;
  }
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function RoleGate({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactElement;
}) {
  const auth = useAuth();
  if (auth.role !== role) {
    return <Navigate to={auth.role === "broker" ? "/broker-dashboard" : "/"} replace />;
  }
  return children;
}

export function BitcoinAddressGate({ children }: { children: React.ReactElement }) {
  const { role, miner } = useAuth();
  const location = useLocation();
  const needsBitcoinAddress = role === "miner" && !miner?.bitcoin_address;
  if (needsBitcoinAddress && location.pathname !== "/setup-bitcoin") {
    return <Navigate to="/setup-bitcoin" replace />;
  }
  return children;
}
