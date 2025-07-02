import { NextRequest, NextResponse } from 'next/server';
import { signUpAction } from '@/app/(auth)/actions';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Client-side validation
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

    // Call the Server Action - single source of truth for business logic  
    const result = await signUpAction(formData);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.error || 'Registration failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API Error during sign up:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 