/**
 * Users — Domain Types
 */

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** User tanpa passwordHash — untuk API response */
export type PublicUser = Omit<User, "passwordHash">;

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  phone?: string;
  photoUrl?: string;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  photoUrl?: string;
  isActive?: boolean;
}
