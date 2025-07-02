import { container } from 'tsyringe';
import { TodoApplicationService } from './todo.application-service';
import type { ITodoApplicationService } from './interfaces';

// Todo application tokens
export const TODO_APPLICATION_TOKENS = {
  ITodoApplicationService: 'ITodoApplicationService',
} as const;

export function registerTodoModule(): void {
  // Register todo application service with interface
  container.register<ITodoApplicationService>(
    TODO_APPLICATION_TOKENS.ITodoApplicationService,
    { useClass: TodoApplicationService }
  );
} 