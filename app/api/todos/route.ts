import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/config';
import { withRequestScoped } from '@/src/infrastructure/di/server-container';
import { USER_APPLICATION_TOKENS, TODO_APPLICATION_TOKENS } from '@/src/application/modules';
import type { ITodoApplicationService, IAuthApplicationService } from '@/src/application/modules';
import { UnauthenticatedError } from '@/src/entities/errors/auth';

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const sessionId = cookies().get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const content = formData.get('content') as string;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    await withRequestScoped(async (getService) => {
      const authService = getService<IAuthApplicationService>(
        USER_APPLICATION_TOKENS.IAuthApplicationService
      );
      const userId = await authService.getUserIdFromSession(sessionId);

      const todoService = getService<ITodoApplicationService>(
        TODO_APPLICATION_TOKENS.ITodoApplicationService
      );
      await todoService.createTodo({ content: content.trim() }, userId);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json(
        { error: 'Unauthenticated' },
        { status: 401 }
      );
    }

    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
} 