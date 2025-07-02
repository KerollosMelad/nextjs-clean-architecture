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
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Direct business logic - most reliable approach
    const result = await withRequestScoped(async (getService) => {
      const authService = getService<IAuthApplicationService>(
        USER_APPLICATION_TOKENS.IAuthApplicationService
      );
      return await authService.signIn({ username, password });
    });

    // Set cookie for successful auth
    cookies().set(result.cookie.name, result.cookie.value, result.cookie.attributes);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during sign in:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Invalid credentials',
      },
      { status: 500 }
    );
  }
} 