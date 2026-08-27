/**
 * Auth Service — Unit Tests
 *
 * Menguji business logic AuthService secara terisolasi.
 * UsersRepository, firestore-helpers, dan bcryptjs di-mock seluruhnya.
 */

import { AuthService } from "@/lib/modules/auth/auth.service";
import { UsersRepository } from "@/lib/modules/users/users.repository";
import { ConflictError, UnauthorizedError } from "@/lib/api/errors";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("@/lib/modules/users/users.repository");
jest.mock("@/lib/firebase/firestore-helpers");
jest.mock("bcryptjs");

// Mock JWT helper agar tidak butuh env vars
jest.mock("@/lib/middleware/auth", () => ({
  generateAccessToken: jest.fn(() => "mock-access-token"),
  generateRefreshToken: jest.fn(() => "mock-refresh-token"),
  verifyRefreshToken: jest.fn(() => ({
    userId: "user-1",
    email: "test@example.com",
    role: "USER",
  })),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  passwordHash: "$2b$12$hashedpassword",
  role: "USER" as const,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const mockPublicUser = {
  id: mockUser.id,
  name: mockUser.name,
  email: mockUser.email,
  role: mockUser.role,
  isActive: mockUser.isActive,
  createdAt: mockUser.createdAt,
  updatedAt: mockUser.updatedAt,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AuthService", () => {
  let authService: AuthService;
  let mockRepo: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    // Bersihkan semua mock calls sebelum setiap test
    jest.clearAllMocks();

    // Dapatkan instance mock yang digenerate jest.mock()
    const MockedUsersRepository = UsersRepository as jest.MockedClass<typeof UsersRepository>;
    mockRepo = new MockedUsersRepository() as jest.Mocked<UsersRepository>;

    // Inject mock repository ke service
    authService = new AuthService(mockRepo);
  });

  // -------------------------------------------------------------------------
  // register
  // -------------------------------------------------------------------------

  describe("register", () => {
    const registerInput = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    it("harus berhasil mendaftarkan user baru dan mengembalikan tokens", async () => {
      // Arrange
      mockRepo.findByEmail = jest.fn().mockResolvedValue(null);
      mockRepo.create = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("$2b$12$hashedpassword");

      // Act
      const result = await authService.register(registerInput);

      // Assert
      expect(mockRepo.findByEmail).toHaveBeenCalledWith(registerInput.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerInput.password, 12);
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: registerInput.name,
          email: registerInput.email,
          passwordHash: "$2b$12$hashedpassword",
          role: "USER",
        })
      );
      expect(result.user).toEqual(mockPublicUser);
      expect(result.accessToken).toBe("mock-access-token");
      expect(result.refreshToken).toBe("mock-refresh-token");
      // passwordHash tidak boleh ada di response
      expect(result.user).not.toHaveProperty("passwordHash");
    });

    it("harus melempar ConflictError jika email sudah terdaftar", async () => {
      // Arrange
      mockRepo.findByEmail = jest.fn().mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.register(registerInput)).rejects.toThrow(ConflictError);
      await expect(authService.register(registerInput)).rejects.toThrow(
        "Email address is already registered"
      );
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // login
  // -------------------------------------------------------------------------

  describe("login", () => {
    const loginInput = {
      email: "test@example.com",
      password: "password123",
    };

    it("harus berhasil login dan mengembalikan tokens", async () => {
      // Arrange
      mockRepo.findByEmail = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.login(loginInput);

      // Assert
      expect(mockRepo.findByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginInput.password, mockUser.passwordHash);
      expect(result.user).toEqual(mockPublicUser);
      expect(result.accessToken).toBe("mock-access-token");
      expect(result.refreshToken).toBe("mock-refresh-token");
    });

    it("harus melempar UnauthorizedError jika email tidak ditemukan", async () => {
      // Arrange
      mockRepo.findByEmail = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginInput)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(loginInput)).rejects.toThrow("Invalid email or password");
    });

    it("harus melempar UnauthorizedError jika password salah", async () => {
      // Arrange
      mockRepo.findByEmail = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginInput)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(loginInput)).rejects.toThrow("Invalid email or password");
    });

    it("harus melempar UnauthorizedError jika user tidak aktif", async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      mockRepo.findByEmail = jest.fn().mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(authService.login(loginInput)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(loginInput)).rejects.toThrow("Account is deactivated");
      // bcrypt.compare tidak boleh dipanggil jika user tidak aktif
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // getMe
  // -------------------------------------------------------------------------

  describe("getMe", () => {
    it("harus mengembalikan PublicUser berdasarkan userId", async () => {
      // Arrange
      mockRepo.findById = jest.fn().mockResolvedValue(mockUser);

      // Act
      const result = await authService.getMe(mockUser.id);

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockPublicUser);
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("harus melempar NotFoundError jika user tidak ditemukan", async () => {
      // Arrange
      mockRepo.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      const { NotFoundError } = await import("@/lib/api/errors");
      await expect(authService.getMe("nonexistent-id")).rejects.toThrow(NotFoundError);
    });
  });
});
