'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { SESSION_COOKIE } from '@/config';
import { 
  withRequestScoped,
  APPLICATION_TOKENS
} from '@/src/infrastructure/di/server-container';
import { USER_APPLICATION_TOKENS, TODO_APPLICATION_TOKENS } from '@/src/application/modules';
import type { ITodoApplicationService, IAuthApplicationService } from '@/src/application/modules';
import type { TodoDTO } from './types';

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

export async function createTodo(content: string): Promise<any> {
  // ✅ NEW: Guaranteed connection cleanup
  return await withRequestScoped(async (getService) => {
    const sessionId = cookies().get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      throw new UnauthenticatedError('No active session found');
    }

    // Get userId from session
    const authService = getService<IAuthApplicationService>(USER_APPLICATION_TOKENS.IAuthApplicationService);
    const userId = await authService.getUserIdFromSession(sessionId);
    
    const todoService = getService<ITodoApplicationService>(TODO_APPLICATION_TOKENS.ITodoApplicationService);
    
    return await todoService.createTodo({ content }, userId);
  });
}

// ✅ FormData-compatible version for UI components
export async function createTodoAction(formData: FormData): Promise<void> {
  const content = formData.get('content') as string;
  
  if (!content?.trim()) {
    return;
  }

  await createTodo(content.trim());
  revalidatePath('/');
}

export async function toggleTodoAction(todoId: number): Promise<void> {
  return await withRequestScoped(async (getService) => {
    const sessionId = cookies().get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      throw new UnauthenticatedError('No active session found');
    }

    // Get userId from session
    const authService = getService<IAuthApplicationService>(USER_APPLICATION_TOKENS.IAuthApplicationService);
    const userId = await authService.getUserIdFromSession(sessionId);
    
    const todoService = getService<ITodoApplicationService>(TODO_APPLICATION_TOKENS.ITodoApplicationService);
    await todoService.toggleTodo({ todoId }, userId);
    
    revalidatePath('/');
  });
}

export async function deleteTodoAction(todoId: number): Promise<void> {
  return await withRequestScoped(async (getService) => {
    const sessionId = cookies().get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      throw new UnauthenticatedError('No active session found');
    }

    // Get userId from session
    const authService = getService<IAuthApplicationService>(USER_APPLICATION_TOKENS.IAuthApplicationService);
    const userId = await authService.getUserIdFromSession(sessionId);
    
    const todoService = getService<ITodoApplicationService>(TODO_APPLICATION_TOKENS.ITodoApplicationService);
    await todoService.deleteTodo({ todoId }, userId);
    
    revalidatePath('/');
  });
}

export async function bulkUpdateTodosAction(formData: FormData): Promise<void> {
  return await withRequestScoped(async (getService) => {
    const sessionId = cookies().get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      throw new UnauthenticatedError('No active session found');
    }

    const todoIds = formData.getAll('todoIds').map(id => parseInt(id as string));
    
    // Get userId from session
    const authService = getService<IAuthApplicationService>(USER_APPLICATION_TOKENS.IAuthApplicationService);
    const userId = await authService.getUserIdFromSession(sessionId);

    const todoService = getService<ITodoApplicationService>(TODO_APPLICATION_TOKENS.ITodoApplicationService);
    
    await todoService.bulkToggleTodos({ todoIds }, userId);

    revalidatePath('/');
  });
}
