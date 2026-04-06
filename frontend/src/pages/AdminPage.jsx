import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../features/admin/components/AdminDashboard";
import AdminMobileNav from "../features/admin/components/AdminMobileNav";
import AdminSidebar from "../features/admin/components/AdminSidebar";
import AdminTopHeader from "../features/admin/components/AdminTopHeader";

const SIDEBAR_ITEMS = [
  { key: "dashboard", label: "Tổng quan", icon: "dashboard" },
];

const FEATURE_COMPONENTS = {
  dashboard: AdminDashboard,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeFeature, setActiveFeature] = useState("dashboard");
  const FeatureComponent = FEATURE_COMPONENTS[activeFeature] || AdminDashboard;
  const fullNameLabel = user?.displayName || "Administrator";
  const userIdLabel = user?.profileCode || user?.userId || "admin";
  const avatarLetter = (fullNameLabel || "A").slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <AdminTopHeader
        fullNameLabel={fullNameLabel}
        userIdLabel={userIdLabel}
        avatarLetter={avatarLetter}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col md:flex-row">
        <AdminSidebar items={SIDEBAR_ITEMS} activeFeature={activeFeature} onSelect={setActiveFeature} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          <FeatureComponent />
        </div>
      </main>

      <AdminMobileNav activeFeature={activeFeature} onSelect={setActiveFeature} onLogout={handleLogout} />
    </div>
  );
}
