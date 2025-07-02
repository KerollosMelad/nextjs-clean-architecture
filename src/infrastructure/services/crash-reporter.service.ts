import { injectable } from 'tsyringe';
import { ICrashReporterService } from '../../application/services/crash-reporter.service.interface';

@injectable()
export class CrashReporterService implements ICrashReporterService {
  report(error: any): void {
    // For now, just log the error
    // In a real implementation, you would use Sentry, Bugsnag, etc.
    console.error('[CRASH REPORTER]', error);
    
    // Log additional context if available
    if (error instanceof Error) {
      console.error('[CRASH REPORTER] Stack:', error.stack);
      console.error('[CRASH REPORTER] Name:', error.name);
      console.error('[CRASH REPORTER] Message:', error.message);
    }
  }
}
