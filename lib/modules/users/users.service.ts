import { UsersRepository } from "./users.repository";
import { NotFoundError } from "@/lib/api/errors";
import type { PublicUser, UpdateUserInput } from "./users.types";
import { mapToPublicUser } from "./users.mapper";

export class UsersService {
  private repo = new UsersRepository();

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return mapToPublicUser(user);
  }

  async updateMe(userId: string, input: UpdateUserInput): Promise<PublicUser> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Only allow updating safe fields
    const safeInput = {
        ...(input.name ? { name: input.name } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.photoUrl ? { photoUrl: input.photoUrl } : {}),
    };

    const updated = await this.repo.update(userId, safeInput);
    if (!updated) {
        throw new NotFoundError("User not found");
    }
    
    return mapToPublicUser(updated);
  }
}
