import { NextRequest, NextResponse } from 'next/server';
import { signInAction } from '@/app/(auth)/actions';

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

    // Call the Server Action - single source of truth for business logic
    const result = await signInAction(formData);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.error || 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('API Error during sign in:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 