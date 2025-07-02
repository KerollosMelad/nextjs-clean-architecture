import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/config';
import { withRequestScoped } from '@/src/infrastructure/di/server-container';
import { USER_APPLICATION_TOKENS } from '@/src/application/modules';
import type { IAuthApplicationService } from '@/src/application/modules';

export async function POST(request: NextRequest) {
  try {
    const sessionId = cookies().get(SESSION_COOKIE)?.value;

    if (sessionId) {
      try {
        await withRequestScoped(async (getService) => {
          const authService = getService<IAuthApplicationService>(
            USER_APPLICATION_TOKENS.IAuthApplicationService
          );
          await authService.signOut(sessionId);
        });
      } catch (error) {
        console.error('Error during sign out:', error);
      }
    }

    // Delete the session cookie
    cookies().delete(SESSION_COOKIE);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during sign out:', error);

    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
} 