import { INFRASTRUCTURE_TOKENS } from '../database/database.module';
import { SERVICE_TOKENS } from '../../services/services.di';
import { REPOSITORY_TOKENS } from '../../repositories/repositories.di';
import { APPLICATION_TOKENS } from '../server-container';

// Combined tokens object for easy access
export const TOKENS = {
  ...INFRASTRUCTURE_TOKENS,
  ...SERVICE_TOKENS,
  ...REPOSITORY_TOKENS,
  ...APPLICATION_TOKENS,
} as const;

// Export individual token categories for modular access
export {
  INFRASTRUCTURE_TOKENS,
  SERVICE_TOKENS,
  REPOSITORY_TOKENS,
  APPLICATION_TOKENS,
}; 