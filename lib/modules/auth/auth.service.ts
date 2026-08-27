/**
 * Auth Service — Movie Reservation System
 *
 * Business logic untuk autentikasi: register, login, refresh token, dan get-me.
 * Semua password di-hash dengan bcrypt (12 rounds) sebelum disimpan.
 */

import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/lib/middleware/auth";
import { UsersRepository } from "@/lib/modules/users/users.repository";
import { mapToPublicUser } from "@/lib/modules/users/users.mapper";
import { ConflictError, UnauthorizedError, NotFoundError } from "@/lib/api/errors";
import type { RegisterInput, LoginInput } from "@/lib/modules/auth/auth.schema";
import type { PublicUser } from "@/lib/modules/users/users.types";

const BCRYPT_ROUNDS = 12;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly usersRepo: UsersRepository;

  constructor(usersRepo?: UsersRepository) {
    this.usersRepo = usersRepo ?? new UsersRepository();
  }

  // ---------------------------------------------------------------------------
  // Register
  // ---------------------------------------------------------------------------

  /**
   * Mendaftarkan user baru.
   * - Memeriksa email duplikat -> ConflictError
   * - Hash password dengan bcrypt (12 rounds)
   * - Buat user dengan role 'USER'
   * - Kembalikan user public dan token pair
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    // Cek duplikat email
    const existing = await this.usersRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("Email address is already registered");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    // Buat user
    const user = await this.usersRepo.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: "USER",
      phone: input.phone,
    });

    const publicUser = mapToPublicUser(user);
    const tokens = this.generateTokens(publicUser);

    return { user: publicUser, ...tokens };
  }

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------

  /**
   * Login user dengan email dan password.
   * - Memeriksa keberadaan user -> UnauthorizedError
   * - Memeriksa status aktif user -> UnauthorizedError
   * - Memverifikasi password dengan bcrypt -> UnauthorizedError
   * - Kembalikan user public dan token pair
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.usersRepo.findByEmail(input.email);
    if (!user) {
      // Jangan bocorkan apakah email terdaftar atau tidak
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated. Please contact support.");
    }

    const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const publicUser = mapToPublicUser(user);
    const tokens = this.generateTokens(publicUser);

    return { user: publicUser, ...tokens };
  }

  // ---------------------------------------------------------------------------
  // Refresh Tokens
  // ---------------------------------------------------------------------------

  /**
   * Menukar refresh token dengan token pair baru.
   * - Verifikasi refresh token signature -> UnauthorizedError (via verifyRefreshToken)
   * - Memeriksa user masih ada dan aktif -> UnauthorizedError
   * - Kembalikan token pair baru (token rotation)
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // Akan melempar UnauthorizedError jika token tidak valid
    const payload = verifyRefreshToken(refreshToken);

    const user = await this.usersRepo.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    const publicUser = mapToPublicUser(user);
    return this.generateTokens(publicUser);
  }

  // ---------------------------------------------------------------------------
  // Get Me
  // ---------------------------------------------------------------------------

  /**
   * Mengambil profil user yang sedang login.
   * - Mencari user berdasarkan ID -> NotFoundError jika tidak ada
   */
  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return mapToPublicUser(user);
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private generateTokens(user: PublicUser): AuthTokens {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}
