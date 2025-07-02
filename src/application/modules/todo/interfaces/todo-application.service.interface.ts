import { Todo } from '../../../../entities/models/todo.entity';

export interface ITodoApplicationService {
  createTodo(input: { content: string }, userId: string): Promise<Todo>;
  toggleTodo(input: { todoId: number }, userId: string): Promise<Todo>;
  deleteTodo(input: { todoId: number }, userId: string): Promise<void>;
  getTodosForUser(userId: string): Promise<Todo[]>;
  updateTodoContent(input: { todoId: number; content: string }, userId: string): Promise<Todo>;
  bulkToggleTodos(input: { todoIds: number[] }, userId: string): Promise<Todo[]>;
} 