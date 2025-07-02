import { injectable, inject } from 'tsyringe';
import { EntityManager } from '@mikro-orm/core';
import { Todo } from '../../../entities/models/todo.entity';
import { User } from '../../../entities/models/user.entity';
import type { ITodoRepository, ITodoApplicationService } from './interfaces';
import type { IUserRepository } from '../user/interfaces';
import type { IAuthenticationService } from '../user/interfaces/authentication.service.interface';
import { INFRASTRUCTURE_TOKENS } from '../../../infrastructure/di/database/database.module';
import { REPOSITORY_TOKENS } from '../../../infrastructure/repositories/repositories.di';
import { SERVICE_TOKENS } from '../../../infrastructure/services/services.di';
import { NotFoundError } from '../../../entities/errors/common';

@injectable()
export class TodoApplicationService implements ITodoApplicationService {
  constructor(
    @inject(INFRASTRUCTURE_TOKENS.EntityManager) private readonly em: EntityManager,
    @inject(REPOSITORY_TOKENS.ITodoRepository) private readonly todoRepository: ITodoRepository,
    @inject(REPOSITORY_TOKENS.IUserRepository) private readonly userRepository: IUserRepository,
    @inject(SERVICE_TOKENS.IAuthenticationService) private readonly authService: IAuthenticationService
  ) {}

  async createTodo(input: { content: string }, userId: string): Promise<Todo> {
    // Get user to check todo limits
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check business rules (user can create todo)
    const currentTodoCount = await this.todoRepository.countByUserId(userId);
    if (!user.canCreateTodo(currentTodoCount)) {
      throw new Error('User has reached maximum todo limit');
    }

    // Create todo using domain logic
    const todo = Todo.create(input.content, userId);

    // Save to database (persists only, doesn't flush)
    await this.todoRepository.create(todo);

    // ✅ Single flush for entire operation (Unit of Work pattern)
    await this.em.flush();

    return todo;
  }

  async toggleTodo(input: { todoId: number }, userId: string): Promise<Todo> {
    // Get todo
    const todo = await this.todoRepository.findById(input.todoId);
    if (!todo) {
      throw new NotFoundError('Todo not found');
    }

    // Use domain logic to toggle (includes authorization)
    todo.toggle(userId);

    // Save changes (persists only, doesn't flush)
    await this.todoRepository.save(todo);

    // ✅ Single flush for entire operation (Unit of Work pattern)
    await this.em.flush();

    return todo;
  }

  async deleteTodo(input: { todoId: number }, userId: string): Promise<void> {
    // Get todo
    const todo = await this.todoRepository.findById(input.todoId);
    if (!todo) {
      throw new NotFoundError('Todo not found');
    }

    // Check business rules (user can delete this todo)
    if (!todo.canBeDeletedBy(userId)) {
      throw new Error('You can only delete your own todos');
    }

    // Delete from database (removes only, doesn't flush)
    await this.todoRepository.delete(input.todoId);

    // ✅ Single flush for entire operation (Unit of Work pattern)
    await this.em.flush();
  }

  async getTodosForUser(userId: string): Promise<Todo[]> {
    // No transaction needed for read-only operation
    return await this.todoRepository.findByUserId(userId);
  }

  async updateTodoContent(
    input: { todoId: number; content: string }, 
    userId: string
  ): Promise<Todo> {
    // Get todo
    const todo = await this.todoRepository.findById(input.todoId);
    if (!todo) {
      throw new NotFoundError('Todo not found');
    }

    // Use domain logic to update content (includes authorization)
    todo.updateContent(input.content, userId);

    // Save changes (persists only, doesn't flush)
    await this.todoRepository.save(todo);

    // ✅ Single flush for entire operation (Unit of Work pattern)
    await this.em.flush();

    return todo;
  }

  async bulkToggleTodos(input: { todoIds: number[] }, userId: string): Promise<Todo[]> {
    const updatedTodos: Todo[] = [];

    for (const todoId of input.todoIds) {
      // Get todo
      const todo = await this.todoRepository.findById(todoId);
      if (!todo) {
        continue; // Skip if todo not found
      }

      // Use domain logic to toggle (includes authorization)
      try {
        todo.toggle(userId);
        await this.todoRepository.save(todo); // Just persists, doesn't flush
        updatedTodos.push(todo);
      } catch (error) {
        // Skip todos that can't be toggled (e.g., not owned by user)
        continue;
      }
    }

    // ✅ Single flush for entire batch operation (Unit of Work pattern)
    await this.em.flush();

    return updatedTodos;
  }
} 