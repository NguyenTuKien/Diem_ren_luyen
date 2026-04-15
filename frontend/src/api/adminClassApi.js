import { apiRequest } from "../shared/api/http";

function unwrapResponse(payload) {
    if (payload && typeof payload === "object" && "data" in payload) {
        return payload.data;
    }
    return payload;
}

export async function createAdminClass({ classCode, facultyId, lecturerId } = {}) {
    const response = await apiRequest("/v1/admin/classes", {
        method: "POST",
        body: JSON.stringify({ classCode, facultyId, lecturerId }),
    });

    return unwrapResponse(response);
}