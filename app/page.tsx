import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE } from '@/config';
import {
  AuthenticationError,
  UnauthenticatedError,
} from '@/src/entities/errors/auth';
import type { TodoDTO } from './types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './_components/ui/card';
import { Separator } from './_components/ui/separator';
import { UserMenu } from './_components/ui/user-menu';
import { CreateTodo } from './add-todo';
import { Todos } from './todos';
import { getTodosAction } from './actions';

export default async function Home() {
  const sessionId = cookies().get(SESSION_COOKIE)?.value;

  // Redirect to sign-in if not authenticated
  if (!sessionId) {
    redirect('/sign-in');
  }

  let todos: TodoDTO[];
  try {
    // Call server action instead of directly accessing DI services
    todos = await getTodosAction();
  } catch (err) {
    // Handle authentication errors by redirecting to sign-in
    if (err instanceof UnauthenticatedError) {
      redirect('/sign-in');
    }
    throw err;
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="flex flex-row items-center">
        <CardTitle className="flex-1">TODOs</CardTitle>
        <UserMenu />
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col p-6 gap-4">
        <CreateTodo />
        <Todos todos={todos} />
      </CardContent>
    </Card>
  );
}
