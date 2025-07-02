'use server';

import { cookies } from 'next/headers';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { SESSION_COOKIE } from '@/config';
import { withRequestScoped } from '@/src/infrastructure/di/server-container';
import { USER_APPLICATION_TOKENS, TODO_APPLICATION_TOKENS } from '@/src/application/modules';
import type { ITodoApplicationService, IAuthApplicationService } from '@/src/application/modules';
import type { TodoDTO } from './types';

// Server Action used by Server Components for data fetching
export async function getTodosAction(): Promise<TodoDTO[]> {
  return await withRequestScoped(async (getService) => {
    const sessionId = cookies().get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      throw new UnauthenticatedError('No active session found');
    }

    // Get userId from session
    const authService = getService<IAuthApplicationService>(USER_APPLICATION_TOKENS.IAuthApplicationService);
    const userId = await authService.getUserIdFromSession(sessionId);
    
    const todoService = getService<ITodoApplicationService>(TODO_APPLICATION_TOKENS.ITodoApplicationService);
    const todos = await todoService.getTodosForUser(userId);
    
    // Convert entities to DTOs for safe client serialization using toJSON()
    return todos.map(todo => todo.toJSON());
  });
}

// Note: Client-side todo mutations (create, toggle, bulk update) now use API routes 
// for consistency with auth operations and reliable production deployment
