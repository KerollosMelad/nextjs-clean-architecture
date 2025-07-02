import { container } from 'tsyringe';
import { AuthApplicationService } from './auth.application-service';
import type { IAuthApplicationService } from './interfaces';

// User application tokens
export const USER_APPLICATION_TOKENS = {
  IAuthApplicationService: 'IAuthApplicationService',
} as const;

export function registerUserModule(): void {
  // Register auth application service with interface
  container.register<IAuthApplicationService>(
    USER_APPLICATION_TOKENS.IAuthApplicationService,
    { useClass: AuthApplicationService }
  );
} 