'use client';

import { Loader, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from './_components/ui/button';
import { Input } from './_components/ui/input';
import { createTodoAction } from './actions';

export function CreateTodo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const formData = new FormData(event.currentTarget);

    setLoading(true);
    try {
      await createTodoAction(formData);
      toast.success('Todo created!');
      
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to create todo');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full gap-2">
      <Input
        ref={inputRef}
        name="content"
        className="flex-1"
        placeholder="Take out trash"
      />
      <Button size="icon" disabled={loading} type="submit">
        {loading ? <Loader className="animate-spin" /> : <Plus />}
      </Button>
    </form>
  );
}
