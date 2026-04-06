import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MonitorClass from "../features/monitor/components/MonitorClass";
import StudentDashboard from "../features/student/components/StudentDashboard";
import QRScanner from "../features/student/components/QRScanner";
import StudentMobileNav from "../features/student/components/StudentMobileNav";
import StudentPlaceholderPanel from "../features/student/components/StudentPlaceholderPanel";
import StudentEventsPanel from "../features/student/components/StudentEventsPanel";
import StudentHistoryPanel from "../features/student/components/StudentHistoryPanel";
import StudentSidebar from "../features/student/components/StudentSidebar";
import StudentTopHeader from "../features/student/components/StudentTopHeader";

function normalizeRole(role) {
  if (!role) return "";
  return String(role).startsWith("ROLE_") ? String(role).slice(5) : String(role);
}

function buildSidebarItems(isMonitor) {
  const baseItems = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "events", label: "Sự kiện", icon: "calendar_month" },
    { key: "history", label: "Lịch sử hoạt động", icon: "history" },
    { key: "evidence", label: "Khai báo minh chứng", icon: "verified_user" },
    { key: "scan-qr", label: "Quét sự kiện", icon: "qr_code_scanner" },
  ];

  if (!isMonitor) {
    return baseItems;
  }

  return [
    ...baseItems,
    { key: "manage-class", label: "Quản lý lớp", icon: "groups" },
  ];
}

const FEATURE_COMPONENTS = {
  dashboard: StudentDashboard,
  "scan-qr": QRScanner,
  "manage-class": MonitorClass,
  events: StudentEventsPanel,
  history: StudentHistoryPanel,
  evidence: () => (
    <StudentPlaceholderPanel
      title="Khai báo minh chứng"
      description="Khu vực này sẽ hiển thị form minh chứng theo quy trình duyệt của ban tổ chức."
    />
  ),
};

export default function StudentPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userRole = normalizeRole(user?.effectiveRole || user?.role);
  const isMonitor = userRole === "MONITOR";

  const [activeFeature, setActiveFeature] = useState("dashboard");

  const sidebarItems = useMemo(() => buildSidebarItems(isMonitor), [isMonitor]);

  const FeatureComponent = FEATURE_COMPONENTS[activeFeature] || StudentDashboard;
  const fullNameLabel = user?.displayName || "Student";
  const userIdLabel = user?.userId || "---";
  const avatarLetter = (fullNameLabel || "S").slice(0, 1).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <StudentTopHeader
        fullNameLabel={fullNameLabel}
        userIdLabel={userIdLabel}
        avatarLetter={avatarLetter}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col md:flex-row">
        <StudentSidebar items={sidebarItems} activeFeature={activeFeature} onSelect={setActiveFeature} />

        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full pb-20 md:pb-8">
          <FeatureComponent onNavigate={setActiveFeature} />
        </div>
      </main>

      <StudentMobileNav activeFeature={activeFeature} onSelect={setActiveFeature} onLogout={handleLogout} />
    </div>
  );
}

