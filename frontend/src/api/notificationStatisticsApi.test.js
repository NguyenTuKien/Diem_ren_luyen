import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../shared/api/http", () => ({
    apiRequest: vi.fn(),
    apiBinaryRequest: vi.fn(),
}));

import { apiBinaryRequest, apiRequest } from "../shared/api/http";
import {
    createLecturerNotification,
    exportLecturerClassStatistics,
    getLecturerClassStatistics,
    getStudentActivityHistory,
} from "./notificationStatisticsApi";

describe("notificationStatisticsApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("builds query params for student activity history", async () => {
        apiRequest.mockResolvedValue({ data: { items: [] } });

        await getStudentActivityHistory({ semesterId: 3, page: 2, size: 15 });

        expect(apiRequest).toHaveBeenCalledWith(
            "/v1/student/activity-history?semesterId=3&page=2&size=15",
        );
    });

    it("calls lecturer statistics endpoint with classId and semesterId", async () => {
        apiRequest.mockResolvedValue({ data: { totalStudents: 30 } });

        await getLecturerClassStatistics({ classId: 12, semesterId: 4 });

        expect(apiRequest).toHaveBeenCalledWith(
            "/v1/lecturer/classes/12/statistics?semesterId=4",
        );
    });

    it("sends multipart payload when creating lecturer notification", async () => {
        apiRequest.mockResolvedValue({ data: { notificationId: 99 } });
        const fileBlob = new Blob(["hello"], { type: "text/plain" });

        await createLecturerNotification({
            title: "Thong bao",
            content: "Noi dung",
            targetType: "CLASS",
            classId: 5,
            file: fileBlob,
        });

        const [, options] = apiRequest.mock.calls[0];
        expect(apiRequest).toHaveBeenCalledWith(
            "/v1/lecturer/notifications",
            expect.objectContaining({ method: "POST" }),
        );
        expect(options.body).toBeInstanceOf(FormData);
        expect(options.body.has("payload")).toBe(true);
        expect(options.body.has("file")).toBe(true);
    });

    it("extracts filename from export response headers", async () => {
        const mockBlob = new Blob(["xlsx-content"]);
        apiBinaryRequest.mockResolvedValue({
            blob: vi.fn().mockResolvedValue(mockBlob),
            headers: {
                get: vi.fn().mockReturnValue("attachment; filename=\"report-lop.xlsx\""),
            },
        });

        const result = await exportLecturerClassStatistics({ classId: 9, semesterId: 1 });

        expect(apiBinaryRequest).toHaveBeenCalledWith(
            "/v1/lecturer/classes/9/statistics/export?semesterId=1",
        );
        expect(result.fileName).toBe("report-lop.xlsx");
        expect(result.blob).toBe(mockBlob);
    });
});
