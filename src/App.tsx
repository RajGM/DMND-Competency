import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AuthGate, RoleGate } from "./auth/guards";
import { BrokerDashboardPage } from "./pages/BrokerDashboardPage";
import { BrokerLoginPage } from "./pages/BrokerLoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SignupPage } from "./pages/SignupPage";
import { BrokerSignupPage } from "./pages/BrokerSignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { WorkersPage } from "./pages/WorkersPage";
import { RewardsPage } from "./pages/RewardsPage";
import { AccountPage } from "./pages/AccountPage";
import { SubAccountsPage } from "./pages/SubAccountsPage";
import { CompetencyTestPage } from "./pages/CompetencyTestPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/broker/login" element={<BrokerLoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/broker/signup" element={<BrokerSignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/"
        element={
          <AuthGate>
            <AppLayout />
          </AuthGate>
        }
      >
        <Route
          index
          element={
            <RoleGate role="miner">
              <DashboardPage />
            </RoleGate>
          }
        />
        <Route
          path="workers"
          element={
            <RoleGate role="miner">
              <WorkersPage />
            </RoleGate>
          }
        />
        <Route
          path="rewards"
          element={
            <RoleGate role="miner">
              <RewardsPage />
            </RoleGate>
          }
        />
        <Route
          path="account"
          element={
            <RoleGate role="miner">
              <AccountPage />
            </RoleGate>
          }
        />
        <Route
          path="sub-accounts"
          element={
            <RoleGate role="miner">
              <SubAccountsPage />
            </RoleGate>
          }
        />
        <Route
          path="competency-test"
          element={
            <RoleGate role="miner">
              <CompetencyTestPage />
            </RoleGate>
          }
        />
        <Route
          path="broker-dashboard"
          element={
            <RoleGate role="broker">
              <BrokerDashboardPage />
            </RoleGate>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
