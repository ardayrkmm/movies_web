/**
 * Users Mapper — Movie Reservation System
 *
 * Fungsi untuk memetakan domain User ke shape yang aman untuk dikirim ke client.
 */

import type { User, PublicUser } from "@/lib/modules/users/users.types";

/**
 * Menghapus passwordHash dari objek User.
 * Gunakan ini sebelum mengembalikan data user di API response.
 *
 * @example
 * const publicUser = mapToPublicUser(user);
 * return successResponse(publicUser, "User fetched");
 */
export function mapToPublicUser(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _pw, ...publicUser } = user;
  return publicUser;
}
