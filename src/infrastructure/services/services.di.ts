import { container } from 'tsyringe';
import type { ICrashReporterService } from '../../application/services/crash-reporter.service.interface';
import { CrashReporterService } from './crash-reporter.service';
import type { IAuthenticationService } from '../../application/modules/user/interfaces/authentication.service.interface';
import { AuthenticationService } from './authentication.service';

// Service tokens
export const SERVICE_TOKENS = {
  ICrashReporterService: 'ICrashReporterService',
  IAuthenticationService: 'IAuthenticationService',
} as const;

export function registerServices(): void {
  // Register crash reporter service
  container.register<ICrashReporterService>(
    SERVICE_TOKENS.ICrashReporterService,
    { useClass: CrashReporterService }
  );
  
  // Register authentication service
  container.register<IAuthenticationService>(
    SERVICE_TOKENS.IAuthenticationService,
    { useClass: AuthenticationService }
  );
} 