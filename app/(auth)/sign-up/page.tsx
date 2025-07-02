'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '../../_components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../_components/ui/card';
import { Input } from '../../_components/ui/input';
import { Label } from '../../_components/ui/label';
import { Separator } from '../../_components/ui/separator';

export default function SignUp() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password')?.toString();
    const confirmPassword = formData.get('confirm_password')?.toString();

    if (!password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords must match');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || 'An unexpected error occurred');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Sign up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col p-6 gap-4">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            {error && <p className="text-destructive">{error}</p>}
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="nikolovlazar"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                name="confirm_password"
                type="password"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                'Create an account'
              )}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/sign-in" className="underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
