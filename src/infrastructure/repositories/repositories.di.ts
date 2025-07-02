import { container } from 'tsyringe';
import type { IUserRepository, ITodoRepository, ISessionRepository } from '../../application/modules';
import { UserRepository } from './user.repository';
import { TodoRepository } from './todo.repository';
import { SessionRepository } from './session.repository';

// Repository tokens
export const REPOSITORY_TOKENS = {
  IUserRepository: 'IUserRepository',
  ITodoRepository: 'ITodoRepository',
  ISessionRepository: 'ISessionRepository',
} as const;

export function registerRepositories(): void {
  // Register user repository
  container.register<IUserRepository>(
    REPOSITORY_TOKENS.IUserRepository,
    { useClass: UserRepository }
  );
  
  // Register todo repository
  container.register<ITodoRepository>(
    REPOSITORY_TOKENS.ITodoRepository,
    { useClass: TodoRepository }
  );
  
  // Register session repository
  container.register<ISessionRepository>(
    REPOSITORY_TOKENS.ISessionRepository,
    { useClass: SessionRepository }
  );
} 