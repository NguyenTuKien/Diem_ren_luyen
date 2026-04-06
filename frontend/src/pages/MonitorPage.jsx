import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MonitorClass from "../features/monitor/components/MonitorClass";

export default function MonitorPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/auth", { replace: true });
    };

    return <MonitorClass onLogout={handleLogout} />;
}