import { NextRequest, NextResponse } from 'next/server';
import { bulkUpdateTodosAction } from '@/app/actions';

// PATCH /api/todos/bulk - Bulk toggle todos
export async function PATCH(request: NextRequest) {
  try {
    const formData = await request.formData();
    const todoIds = formData.getAll('todoIds').map(id => parseInt(id as string));

    if (todoIds.length === 0 || todoIds.some(isNaN)) {
      return NextResponse.json(
        { error: 'Invalid todo IDs' },
        { status: 400 }
      );
    }

    // Call the Server Action - single source of truth for business logic
    await bulkUpdateTodosAction(formData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error bulk updating todos:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('No active session')) {
      return NextResponse.json(
        { error: 'Unauthenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update todos' },
      { status: 500 }
    );
  }
} 