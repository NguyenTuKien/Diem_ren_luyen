import { apiBinaryRequest, apiRequest } from "../shared/api/http";

function unwrapResponse(payload) {
    if (payload && typeof payload === "object" && "data" in payload) {
        return payload.data;
    }
    return payload;
}

function buildQuery(params) {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            search.append(key, String(value));
        }
    });

    const query = search.toString();
    return query ? `?${query}` : "";
}

function extractFileName(contentDisposition, fallbackName) {
    if (!contentDisposition) {
        return fallbackName;
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        try {
            return decodeURIComponent(utf8Match[1]);
        } catch {
            return utf8Match[1];
        }
    }

    const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (basicMatch?.[1]) {
        return basicMatch[1];
    }

    return fallbackName;
}

export async function getStudentActivityHistory({ semesterId, page = 0, size = 20 } = {}) {
    const response = await apiRequest(
        `/v1/student/activity-history${buildQuery({ semesterId, page, size })}`,
    );
    return unwrapResponse(response);
}

export async function getStudentScoreTrend() {
    const response = await apiRequest("/v1/student/score-trend");
    return unwrapResponse(response);
}

export async function getLecturerClassStatistics({ classId, semesterId } = {}) {
    if (!classId) {
        throw new Error("Thiếu classId để lấy thống kê lớp.");
    }

    const response = await apiRequest(
        `/v1/lecturer/classes/${classId}/statistics${buildQuery({ semesterId })}`,
    );
    return unwrapResponse(response);
}

export async function exportLecturerClassStatistics({ classId, semesterId } = {}) {
    if (!classId) {
        throw new Error("Thiếu classId để xuất báo cáo lớp.");
    }

    const response = await apiBinaryRequest(
        `/v1/lecturer/classes/${classId}/statistics/export${buildQuery({ semesterId })}`,
    );

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition");
    const fileName = extractFileName(contentDisposition, `bao-cao-lop-${classId}.xlsx`);

    return { blob, fileName };
}

export async function createLecturerNotification({ title, content, targetType, classId, file } = {}) {
    const formData = new FormData();
    const payload = {
        title,
        content,
        targetType,
        classId: targetType === "CLASS" ? Number(classId) : null,
    };

    formData.append(
        "payload",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );

    if (file) {
        formData.append("file", file);
    }

    const response = await apiRequest("/v1/lecturer/notifications", {
        method: "POST",
        body: formData,
    });

    return unwrapResponse(response);
}

export async function getStudentNotifications({ page = 0, size = 20 } = {}) {
    const response = await apiRequest(
        `/v1/student/notifications${buildQuery({ page, size })}`,
    );
    return unwrapResponse(response);
}

export async function getStudentNotificationUnreadCount() {
    const response = await apiRequest("/v1/student/notifications/unread-count");
    return unwrapResponse(response);
}

export async function markStudentNotificationAsRead(recipientId) {
    if (!recipientId) {
        throw new Error("Thiếu recipientId để đánh dấu đã đọc.");
    }

    const response = await apiRequest(`/v1/student/notifications/${recipientId}/read`, {
        method: "PUT",
    });
    return unwrapResponse(response);
}

export async function downloadStudentNotificationAttachment(recipientId) {
    if (!recipientId) {
        throw new Error("Thiếu recipientId để tải file đính kèm.");
    }

    const response = await apiBinaryRequest(`/v1/student/notifications/${recipientId}/attachment`);
    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition");
    const fileName = extractFileName(contentDisposition, `notification-${recipientId}-attachment`);

    return { blob, fileName };
}
