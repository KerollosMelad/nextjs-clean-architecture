'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { Checkbox } from './_components/ui/checkbox';
import { cn } from './_components/utils';
import { Button } from './_components/ui/button';
import type { TodoDTO } from './types';

export function Todos({ todos }: { todos: TodoDTO[] }) {
  const [bulkMode, setBulkMode] = useState(false);
  const [dirty, setDirty] = useState<number[]>([]);
  const [deleted, setDeleted] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = useCallback(
    async (id: number) => {
      if (bulkMode) {
        const dirtyIndex = dirty.findIndex((t) => t === id);
        if (dirtyIndex > -1) {
          const newDirty = Object.assign([], dirty);
          newDirty.splice(dirtyIndex, 1);
          setDirty(newDirty);
        } else {
          setDirty([...dirty, id]);
        }
      } else {
        try {
          const response = await fetch(`/api/todos/${id}`, {
            method: 'PATCH',
          });

          const result = await response.json();

          if (response.ok && result.success) {
            toast.success('Todo toggled!');
            router.refresh(); // Refresh to show updated state
          } else {
            toast.error(result.error || 'Failed to toggle todo');
          }
        } catch (error) {
          toast.error('Failed to toggle todo');
        }
      }
    },
    [bulkMode, dirty, router]
  );

  const markForDeletion = useCallback(
    (id: number) => {
      const dirtyIndex = dirty.findIndex((t) => t === id);
      if (dirtyIndex > -1) {
        const newDirty = Object.assign([], dirty);
        newDirty.splice(dirtyIndex, 1);
        setDirty(newDirty);
      }

      const deletedIndex = deleted.findIndex((t) => t === id);
      if (deletedIndex === -1) {
        setDeleted((d) => [...d, id]);
      } else {
        const newDeleted = Object.assign([], deleted);
        newDeleted.splice(deletedIndex, 1);
        setDeleted(newDeleted);
      }
    },
    [deleted, dirty]
  );

  const updateAll = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      dirty.forEach(id => formData.append('todoIds', id.toString()));

      const response = await fetch('/api/todos/bulk', {
        method: 'PATCH',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Bulk update completed!');
        router.refresh(); // Refresh to show updated state
      } else {
        toast.error(result.error || 'Failed to update todos');
      }
    } catch (error) {
      toast.error('Failed to update todos');
    }
    setLoading(false);
    setBulkMode(false);
    setDirty([]);
    setDeleted([]);
  };

  return (
    <>
      <ul className="w-full">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <li
              key={todo.id}
              className="h-10 flex items-center gap-2 w-full hover:bg-muted/50 active:bg-muted rounded-sm p-1"
            >
              <Checkbox
                checked={
                  dirty.findIndex((t) => t === todo.id) > -1
                    ? !todo.completed
                    : todo.completed
                }
                onCheckedChange={() => handleToggle(todo.id)}
                id={`checkbox-${todo.id}`}
                disabled={
                  deleted.findIndex((t) => t === todo.id) > -1 || loading
                }
              />
              <label
                htmlFor={`checkbox-${todo.id}`}
                className={cn('flex-1 cursor-pointer', {
                  'text-muted-foreground line-through':
                    dirty.findIndex((t) => t === todo.id) > -1
                      ? !todo.completed
                      : todo.completed,
                  'text-destructive line-through':
                    deleted.findIndex((t) => t === todo.id) > -1,
                })}
              >
                {todo.content}
              </label>
              {bulkMode && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="p-3"
                  disabled={loading}
                  onClick={() => markForDeletion(todo.id)}
                >
                  <Trash size={16} />
                </Button>
              )}
            </li>
          ))
        ) : (
          <p>No todos. Create some to get started!</p>
        )}
      </ul>
      {bulkMode ? (
        <div className="w-full grid grid-cols-2 gap-2">
          <Button disabled={loading} onClick={updateAll}>
            {loading ? <Loader className="animate-spin" /> : 'Update all'}
          </Button>
          <Button variant="secondary" onClick={() => setBulkMode(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button onClick={() => setBulkMode(true)}>Bulk operations</Button>
      )}
    </>
  );
}
