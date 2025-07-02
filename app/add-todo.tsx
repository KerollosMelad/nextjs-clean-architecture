'use client';

import { Loader, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from './_components/ui/button';
import { Input } from './_components/ui/input';

export function CreateTodo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const formData = new FormData(event.currentTarget);
    const content = formData.get('content')?.toString();

    if (!content?.trim()) {
      toast.error('Content is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Todo created!');
        
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        
        // Refresh the page to show the new todo
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to create todo');
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
