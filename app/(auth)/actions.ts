'use server';

import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/config';
import { withRequestScoped } from '@/src/infrastructure/di/server-container';
import { USER_APPLICATION_TOKENS } from '@/src/application/modules';
import type { IAuthApplicationService } from '@/src/application/modules';

export async function signUpAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    const result = await withRequestScoped(async (getService) => {
      const authService = getService<IAuthApplicationService>(USER_APPLICATION_TOKENS.IAuthApplicationService);
      return await authService.signUp({ username, password });
    });
    
    // Set cookie for successful auth
    cookies().set(result.cookie.name, result.cookie.value, result.cookie.attributes);
    
    return { success: true };
    
  } catch (error) {
    console.error('Error during sign up:', error);
    
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function signInAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    const result = await withRequestScoped(async (getService) => {
      const authService = getService<IAuthApplicationService>(USER_APPLICATION_TOKENS.IAuthApplicationService);
      return await authService.signIn({ username, password });
    });
    
    // Set cookie for successful auth
    cookies().set(result.cookie.name, result.cookie.value, result.cookie.attributes);
    
    return { success: true };
    
  } catch (error) {
    console.error('Error during sign in:', error);
    
    return {
      error: error instanceof Error ? error.message : 'Invalid credentials',
    };
  }
}

export async function signOutAction(): Promise<void> {
  const sessionId = cookies().get(SESSION_COOKIE)?.value;
  
  if (sessionId) {
    try {
      await withRequestScoped(async (getService) => {
        const authService = getService<IAuthApplicationService>(USER_APPLICATION_TOKENS.IAuthApplicationService);
        await authService.signOut(sessionId);
      });
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }
  
  // Delete the session cookie
  cookies().delete(SESSION_COOKIE);
}
