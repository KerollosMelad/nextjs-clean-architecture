// Data Transfer Objects for Client Components
// These are plain objects without methods, safe for serialization

export interface TodoDTO {
  id: number;
  content: string;
  completed: boolean;
  userId: string;
}

export interface UserDTO {
  id: string;
  username: string;
} 