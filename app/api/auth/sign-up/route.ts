import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/config';
import { withRequestScoped } from '@/src/infrastructure/di/server-container';
import { USER_APPLICATION_TOKENS } from '@/src/application/modules';
import type { IAuthApplicationService } from '@/src/application/modules';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Validation
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (!username || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords must match' },
        { status: 400 }
      );
    }

    // Direct business logic - most reliable approach
    const result = await withRequestScoped(async (getService) => {
      const authService = getService<IAuthApplicationService>(
        USER_APPLICATION_TOKENS.IAuthApplicationService
      );
      return await authService.signUp({ username, password });
    });

    // Set cookie for successful auth
    cookies().set(result.cookie.name, result.cookie.value, result.cookie.attributes);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during sign up:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
} 