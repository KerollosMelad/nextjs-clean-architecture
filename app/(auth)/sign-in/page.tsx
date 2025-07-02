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

export default function SignIn() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const formData = new FormData(event.currentTarget);
    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || 'Invalid credentials');
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
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Enter your username and password to access your account
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
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader className="animate-spin" /> : 'Sign in'}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="underline">
              Create an account
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
