'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from './avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

export function UserMenu() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
      });

      if (response.ok) {
        // ✅ Redirect to sign-in page after successful sign-out
        router.push('/sign-in');
        router.refresh(); // Refresh to update auth state
      } else {
        console.error('Sign out failed');
        // Still redirect even if there was an error
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still redirect even if there was an error
      router.push('/sign-in');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarFallback>👤</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
