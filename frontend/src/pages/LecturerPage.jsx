import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../shared/api/http";
import EventDashboard from "../features/lecturer/components/EventDashboard";
import LecturerDashboardOverview from "../features/lecturer/components/LecturerDashboardOverview";
import LecturerMobileNav from "../features/lecturer/components/LecturerMobileNav";
import LecturerSidebar from "../features/lecturer/components/LecturerSidebar";
import LecturerStudentManagement from "../features/lecturer/components/LecturerStudentManagement";
import LecturerTopHeader from "../features/lecturer/components/LecturerTopHeader";

const SIDEBAR_ITEMS_BASE = [
  { key: "dashboard", label: "Tổng quan", icon: "dashboard" },
  { key: "events", label: "Sự kiện", icon: "calendar_today" },
  { key: "students", label: "Sinh viên", icon: "group" },
  { key: "notifications", label: "Thông báo", icon: "notifications" },
];

function LecturerPlaceholderPanel({ title, description }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </section>
  );
}

export default function LecturerPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeFeature, setActiveFeature] = useState("dashboard");
  const [shouldOpenCreateEventModal, setShouldOpenCreateEventModal] = useState(false);
  const [dashboardSummaryLoading, setDashboardSummaryLoading] = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState({
    totalEvents: 0,
    participatingStudents: 0,
    pendingEvidence: 0,
    newNotifications: 0,
    passRate: 0,
    scoreDistribution: [],
    upcomingEvents: [],
  });

  useEffect(() => {
    let ignore = false;

    async function loadDashboardSummary() {
      if (!ignore) {
        setDashboardSummaryLoading(true);
      }
      try {
        const data = await apiRequest("/v1/lecturer/dashboard");
        if (!ignore && data) {
          setDashboardSummary({
            totalEvents: data.totalEvents || 0,
            participatingStudents: data.participatingStudents || 0,
            pendingEvidence: data.pendingEvidence || 0,
            newNotifications: data.newNotifications || 0,
            passRate: data.passRate || 0,
            scoreDistribution: Array.isArray(data.scoreDistribution) ? data.scoreDistribution : [],
            upcomingEvents: Array.isArray(data.upcomingEvents) ? data.upcomingEvents : [],
          });
        }
      } catch {
        // Keep zero fallback when dashboard summary cannot be loaded.
      } finally {
        if (!ignore) {
          setDashboardSummaryLoading(false);
        }
      }
    }

    loadDashboardSummary();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateEventFromOverview = () => {
    setShouldOpenCreateEventModal(true);
    setActiveFeature("events");
  };

  const handleCreateEventRequestHandled = () => {
    setShouldOpenCreateEventModal(false);
  };

  const handleFeatureSelect = (featureKey) => {
    setShouldOpenCreateEventModal(false);
    setActiveFeature(featureKey);
  };

  const sidebarItems = useMemo(
    () => SIDEBAR_ITEMS_BASE.map((item) => {
      if (item.key !== "notifications") {
        return item;
      }
      return {
        ...item,
        badge: dashboardSummary.newNotifications > 0 ? dashboardSummary.newNotifications : undefined,
      };
    }),
    [dashboardSummary.newNotifications],
  );

  const featureComponents = {
    dashboard: {
      Component: LecturerDashboardOverview,
      props: {
        summary: dashboardSummary,
        onCreateEvent: handleCreateEventFromOverview,
        loadingSummary: dashboardSummaryLoading,
      },
    },
    events: {
      Component: EventDashboard,
      props: {
        shouldOpenCreateEventModal,
        onCreateEventRequestHandled: handleCreateEventRequestHandled,
      },
    },
    students: { Component: LecturerStudentManagement, props: {} },
    notifications: {
      Component: LecturerPlaceholderPanel,
      props: {
        title: "Thông báo",
        description: "Bản thông báo cho giảng viên đang được cập nhật.",
      },
    },
  };

  const { Component: FeatureComponent, props } =
    featureComponents[activeFeature] || featureComponents.dashboard;
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
          items={sidebarItems}
          activeFeature={activeFeature}
          onSelect={handleFeatureSelect}
          fullNameLabel={fullNameLabel}
          userIdLabel={userIdLabel}
          avatarLetter={avatarLetter}
        />
        <div className="p-4 md:p-8 pb-20 md:pb-8">
          <FeatureComponent {...props} />
        </div>
      </main>

      <LecturerMobileNav activeFeature={activeFeature} onSelect={handleFeatureSelect} onLogout={handleLogout} />
    </div>
  );
}

