// This file provides DI setup functions for server-side initialization only
// Client components should NEVER import from here - they should call server actions instead

// Export individual module registration functions (for internal server DI setup only)
export { registerServices } from '../services/services.di';
export { registerRepositories } from '../repositories/repositories.di';
export { registerUserModule } from '../../application/modules/user/user.di';
export { registerTodoModule } from '../../application/modules/todo/todo.di';
export { registerDatabase } from './database/database.module'; 