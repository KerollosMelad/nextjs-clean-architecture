import { Todo } from '../../../../entities';

export interface ITodoRepository {
  findById(id: number): Promise<Todo | null>;
  findByUserId(userId: string): Promise<Todo[]>;
  save(todo: Todo): Promise<void>;
  create(todo: Todo): Promise<Todo>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
  findCompletedByUserId(userId: string): Promise<Todo[]>;
  findPendingByUserId(userId: string): Promise<Todo[]>;
} 