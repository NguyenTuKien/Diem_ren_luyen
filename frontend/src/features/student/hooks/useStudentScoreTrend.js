import { useEffect, useState } from "react";
import { getStudentScoreTrend } from "../../../api/notificationStatisticsApi";

export function useStudentScoreTrend(userId) {
    const [trend, setTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        async function fetchTrend() {
            setLoading(true);
            setError("");
            try {
                const payload = await getStudentScoreTrend();
                if (!ignore) {
                    setTrend(Array.isArray(payload?.semesters) ? payload.semesters : []);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message || "Không tải được xu hướng điểm rèn luyện.");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        if (userId) {
            fetchTrend();
        } else {
            setLoading(false);
        }

        return () => {
            ignore = true;
        };
    }, [userId]);

    return { trend, loading, error };
}
