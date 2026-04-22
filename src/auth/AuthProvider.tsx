import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiClient } from "../lib/apiClient";
import { BrokerSession, MinerSession, Permissions, UserRole } from "../types/api";

interface AuthState {
  role: UserRole | null;
  miner: MinerSession | null;
  broker: BrokerSession | null;
  permissions: Permissions | null;
  checking: boolean;
}

interface AuthContextValue extends AuthState {
  loginMiner: (email: string, password: string) => Promise<void>;
  loginBroker: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TAB_SESSION_KEY = "dmnd_tab_role";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    role: null,
    miner: null,
    broker: null,
    permissions: null,
    checking: true,
  });

  const refreshPermissions = useCallback(async () => {
    if (state.role !== "miner") return;
    try {
      const permissions = await apiClient.getPermissions();
      setState((prev) => ({ ...prev, permissions }));
    } catch {
      setState((prev) => ({ ...prev, permissions: null }));
    }
  }, [state.role]);

  useEffect(() => {
    const bootstrap = async () => {
      const tabRole = window.sessionStorage.getItem(TAB_SESSION_KEY);
      if (tabRole !== "miner" && tabRole !== "broker") {
        setState((prev) => ({ ...prev, checking: false }));
        return;
      }
      try {
        if (tabRole === "miner") {
          const miner = await apiClient.checkMinerSession();
          setState({
            role: "miner",
            miner,
            broker: null,
            permissions: null,
            checking: false,
          });
        } else {
          const broker = await apiClient.checkBrokerSession();
          setState({
            role: "broker",
            miner: null,
            broker,
            permissions: null,
            checking: false,
          });
        }
      } catch {
        setState((prev) => ({ ...prev, checking: false }));
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  const loginMiner = useCallback(async (email: string, password: string) => {
    const miner = await apiClient.minerLogin(email, password);
    window.sessionStorage.setItem(TAB_SESSION_KEY, "miner");
    setState({
      role: "miner",
      miner,
      broker: null,
      permissions: null,
      checking: false,
    });
  }, []);

  const loginBroker = useCallback(async (email: string, password: string) => {
    const broker = await apiClient.brokerLogin(email, password);
    window.sessionStorage.setItem(TAB_SESSION_KEY, "broker");
    setState({
      role: "broker",
      miner: null,
      broker,
      permissions: null,
      checking: false,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } finally {
      window.sessionStorage.removeItem(TAB_SESSION_KEY);
      setState({
        role: null,
        miner: null,
        broker: null,
        permissions: null,
        checking: false,
      });
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, loginMiner, loginBroker, logout, refreshPermissions }),
    [state, loginMiner, loginBroker, logout, refreshPermissions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used in AuthProvider");
  return ctx;
}
