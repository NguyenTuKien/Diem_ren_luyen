import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StudentDashboard from "../features/student/components/StudentDashboard";
import QRScanner from "../features/student/components/QRScanner";
import StudentMobileNav from "../features/student/components/StudentMobileNav";
import StudentPlaceholderPanel from "../features/student/components/StudentPlaceholderPanel";
import StudentSidebar from "../features/student/components/StudentSidebar";
import StudentTopHeader from "../features/student/components/StudentTopHeader";
import StudentEventsPanel from "../features/student/components/StudentEventsPanel";
import StudentAttendancePanel from "../features/student/components/StudentAttendancePanel";

const SIDEBAR_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "events", label: "Su kien", icon: "calendar_month" },
  { key: "history", label: "Lich su hoat dong", icon: "history" },
  { key: "evidence", label: "Khai bao minh chung", icon: "verified_user" },
  { key: "scan-qr", label: "Quet su kien", icon: "qr_code_scanner" },
];

const FEATURE_COMPONENTS = {
  dashboard: StudentDashboard,
  "scan-qr": QRScanner,
  events: StudentEventsPanel,
  history: StudentAttendancePanel,
  evidence: () => (
    <StudentPlaceholderPanel
      title="Khai bao minh chung"
      description="Khu vuc nay se hien thi form minh chung theo quy trinh duyet cua ban to chuc."
    />
  ),
};

export default function StudentPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeFeature, setActiveFeature] = useState("dashboard");

  const FeatureComponent = FEATURE_COMPONENTS[activeFeature] || StudentDashboard;
  const fullNameLabel = user?.displayName || "Student";
  const userIdLabel = user?.profileCode || user?.userId || "---";
  const avatarLetter = (fullNameLabel || "S").slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    await logout();
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
        <StudentSidebar items={SIDEBAR_ITEMS} activeFeature={activeFeature} onSelect={setActiveFeature} />

        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full pb-20 md:pb-8">
          <FeatureComponent onNavigate={setActiveFeature} />
        </div>
      </main>

      <StudentMobileNav activeFeature={activeFeature} onSelect={setActiveFeature} onLogout={handleLogout} />
    </div>
  );
}
