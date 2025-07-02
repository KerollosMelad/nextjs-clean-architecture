import { NextRequest, NextResponse } from 'next/server';
import { getTodosAction, createTodoAction } from '@/app/actions';

// GET /api/todos - Get all todos for the authenticated user
export async function GET() {
  try {
    // Call the Server Action - single source of truth for business logic
    const todos = await getTodosAction();
    return NextResponse.json({ todos });
  } catch (error) {
    console.error('API Error fetching todos:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('No active session')) {
      return NextResponse.json(
        { error: 'Unauthenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const content = formData.get('content')?.toString();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Call the Server Action - single source of truth for business logic
    await createTodoAction(formData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error creating todo:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('No active session')) {
      return NextResponse.json(
        { error: 'Unauthenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
} 