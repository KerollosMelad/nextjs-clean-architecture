import { NextRequest, NextResponse } from 'next/server';
import { toggleTodoAction, deleteTodoAction } from '@/app/actions';

// PATCH /api/todos/[id] - Toggle todo completion status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const todoId = parseInt(params.id);
    if (isNaN(todoId)) {
      return NextResponse.json(
        { error: 'Invalid todo ID' },
        { status: 400 }
      );
    }

    // Call the Server Action - single source of truth for business logic
    await toggleTodoAction(todoId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error toggling todo:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('No active session')) {
      return NextResponse.json(
        { error: 'Unauthenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to toggle todo' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const todoId = parseInt(params.id);
    if (isNaN(todoId)) {
      return NextResponse.json(
        { error: 'Invalid todo ID' },
        { status: 400 }
      );
    }

    // Call the Server Action - single source of truth for business logic
    await deleteTodoAction(todoId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error deleting todo:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('No active session')) {
      return NextResponse.json(
        { error: 'Unauthenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
} 