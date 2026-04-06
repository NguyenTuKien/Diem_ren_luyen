import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EventDashboard from "../features/lecturer/components/EventDashboard";
import LecturerDashboardOverview from "../features/lecturer/components/LecturerDashboardOverview";
import LecturerMobileNav from "../features/lecturer/components/LecturerMobileNav";
import LecturerSidebar from "../features/lecturer/components/LecturerSidebar";
import LecturerStudentManagement from "../features/lecturer/components/LecturerStudentManagement";
import LecturerTopHeader from "../features/lecturer/components/LecturerTopHeader";

const SIDEBAR_ITEMS = [
  { key: "dashboard", label: "Tổng quan", icon: "dashboard" },
  { key: "events", label: "Sự kiện", icon: "calendar_today" },
  { key: "students", label: "Sinh viên", icon: "group" },
  { key: "scores", label: "Điểm rèn luyện", icon: "grade" },
  { key: "notifications", label: "Thông báo", icon: "notifications", badge: 5 },
];

function LecturerPlaceholderPanel({ title, description }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </section>
  );
}

const FEATURE_COMPONENTS = {
  dashboard: { Component: LecturerDashboardOverview, props: {} },
  events: { Component: EventDashboard, props: {} },
  students: { Component: LecturerStudentManagement, props: {} },
  scores: {
    Component: LecturerPlaceholderPanel,
    props: {
      title: "Điểm rèn luyện",
      description: "Khu vực tổng hợp và duyệt điểm rèn luyện sinh viên sẽ được mở rộng tại đây.",
    },
  },
  notifications: {
    Component: LecturerPlaceholderPanel,
    props: {
      title: "Thông báo",
      description: "Bản thông báo cho giảng viên đang được cập nhật.",
    },
  },
};

export default function LecturerPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeFeature, setActiveFeature] = useState("dashboard");
  const { Component: FeatureComponent, props } =
    FEATURE_COMPONENTS[activeFeature] || FEATURE_COMPONENTS.dashboard;
  const fullNameLabel = user?.displayName || "Lecturer";
  const userIdLabel = user?.profileCode || user?.userId || "---";
  const avatarLetter = (fullNameLabel || "L").slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <LecturerTopHeader
        onLogout={handleLogout}
      />

      <main className="flex-1 md:ml-64">
        <LecturerSidebar
          items={SIDEBAR_ITEMS}
          activeFeature={activeFeature}
          onSelect={setActiveFeature}
          fullNameLabel={fullNameLabel}
          userIdLabel={userIdLabel}
          avatarLetter={avatarLetter}
        />
        <div className="p-4 md:p-8 pb-20 md:pb-8">
          <FeatureComponent {...props} />
        </div>
      </main>

      <LecturerMobileNav activeFeature={activeFeature} onSelect={setActiveFeature} onLogout={handleLogout} />
    </div>
  );
}

