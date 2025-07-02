import { NextRequest, NextResponse } from 'next/server';
import { signOutAction } from '@/app/(auth)/actions';

export async function POST(request: NextRequest) {
  try {
    // Call the Server Action - single source of truth for business logic
    await signOutAction();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error during sign out:', error);
    
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
} 