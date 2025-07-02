import { injectable, inject } from 'tsyringe';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../../entities';
import type { IUserRepository } from '../../application/modules';
import { INFRASTRUCTURE_TOKENS } from '../di/database/database.module';

@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject(INFRASTRUCTURE_TOKENS.EntityManager) private readonly em: EntityManager
  ) {}

  async findById(id: string): Promise<User | null> {
    return await this.em.findOne(User, { id } as any);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.em.findOne(User, { username } as any);
  }

  async save(user: User): Promise<void> {
    this.em.persist(user); // ✅ Just persist, don't flush (Unit of Work pattern)
  }

  async create(user: User): Promise<User> {
    this.em.persist(user); // ✅ Just persist, don't flush (Unit of Work pattern)
    return user;
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (user) {
      this.em.remove(user); // ✅ Just remove, don't flush (Unit of Work pattern)
    }
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.em.count(User, { id } as any);
    return count > 0;
  }

  async usernameExists(username: string): Promise<boolean> {
    const count = await this.em.count(User, { username } as any);
    return count > 0;
  }
} 