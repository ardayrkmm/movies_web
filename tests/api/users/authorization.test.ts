import { GET as getMe, PATCH as updateMe } from "@/app/api/v1/users/me/route";
import { GET as getHistory } from "@/app/api/v1/users/me/reservations/route";
import { generateAccessToken } from "@/lib/middleware/auth";
import { UsersService } from "@/lib/modules/users/users.service";
import { ReservationsService } from "@/lib/modules/reservations/reservations.service";

// Mock dependencies
jest.mock("@/lib/modules/users/users.service");
jest.mock("@/lib/modules/reservations/reservations.service");

describe("Users API Authorization", () => {
  const mockUser = {
    userId: "user-123",
    email: "user@example.com",
    role: "USER" as const,
  };

  const validToken = generateAccessToken(mockUser);

  beforeEach(() => {
    jest.clearAllMocks();
    (UsersService.prototype.getMe as jest.Mock).mockResolvedValue({ id: "user-123", name: "Test User" });
    (UsersService.prototype.updateMe as jest.Mock).mockResolvedValue({ id: "user-123", name: "Updated User" });
    (ReservationsService.prototype.getUserBookingHistory as jest.Mock).mockResolvedValue({
        items: [], total: 0, page: 1, limit: 10
    });
  });

  const createRequest = (method: string, token?: string, body?: any) => {
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    
    return new Request("http://localhost:3000/api/v1/users/me", {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  describe("GET /api/v1/users/me", () => {
    it("should return 401 without token", async () => {
      const req = createRequest("GET");
      const res = await getMe(req);
      expect(res.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      const req = createRequest("GET", "invalid-token");
      const res = await getMe(req);
      expect(res.status).toBe(401);
    });

    it("should return 200 with valid token", async () => {
      const req = createRequest("GET", validToken);
      const res = await getMe(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.name).toBe("Test User");
    });
  });

  describe("PATCH /api/v1/users/me", () => {
    it("should return 401 without token", async () => {
      const req = createRequest("PATCH", undefined, { name: "New Name" });
      const res = await updateMe(req);
      expect(res.status).toBe(401);
    });

    it("should return 200 with valid token", async () => {
      const req = createRequest("PATCH", validToken, { name: "New Name" });
      const res = await updateMe(req);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/users/me/reservations", () => {
    const createHistoryRequest = (token?: string) => {
      const headers = new Headers();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return new Request("http://localhost:3000/api/v1/users/me/reservations", {
        method: "GET",
        headers,
      });
    };

    it("should return 401 without token", async () => {
      const req = createHistoryRequest();
      const res = await getHistory(req);
      expect(res.status).toBe(401);
    });

    it("should return 200 with valid token", async () => {
      const req = createHistoryRequest(validToken);
      const res = await getHistory(req);
      expect(res.status).toBe(200);
    });
  });
});
