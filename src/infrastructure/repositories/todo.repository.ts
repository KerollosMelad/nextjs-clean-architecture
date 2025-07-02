import { injectable, inject } from 'tsyringe';
import { EntityManager } from '@mikro-orm/core';
import { Todo } from '../../entities/models/todo.entity';
import type { ITodoRepository } from '../../application/modules';
import { INFRASTRUCTURE_TOKENS } from '../di/database/database.module';

@injectable()
export class TodoRepository implements ITodoRepository {
  constructor(
    @inject(INFRASTRUCTURE_TOKENS.EntityManager) private readonly em: EntityManager
  ) {}

  async findById(id: number): Promise<Todo | null> {
    return await this.em.findOne(Todo, { id } as any);
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    return await this.em.find(Todo, { user_id: userId } as any);
  }

  async save(todo: Todo): Promise<void> {
    this.em.persist(todo); // ✅ Just persist, don't flush (Unit of Work pattern)
  }

  async create(todo: Todo): Promise<Todo> {
    this.em.persist(todo); // ✅ Just persist, don't flush (Unit of Work pattern)
    return todo;
  }

  async delete(id: number): Promise<void> {
    const todo = await this.findById(id);
    if (todo) {
      this.em.remove(todo); // ✅ Just remove, don't flush (Unit of Work pattern)
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.em.count(Todo, { id } as any);
    return count > 0;
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.em.count(Todo, { user_id: userId } as any);
  }

  async findCompletedByUserId(userId: string): Promise<Todo[]> {
    return await this.em.find(Todo, { user_id: userId, completed: true } as any);
  }

  async findPendingByUserId(userId: string): Promise<Todo[]> {
    return await this.em.find(Todo, { user_id: userId, completed: false } as any);
  }
} 