import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { InputParseError } from '../errors/common';
import { UnauthorizedError } from '../errors/auth';
import type { User } from '../types';

export interface TodoProps {
  id?: number; // Optional for new entities, required for database reconstruction
  content: string;
  completed: boolean;
  userId: string;
}

@Entity()
export class Todo {
  @PrimaryKey()
  private id?: number; // ✅ Optional until set by database

  @Property()
  private content!: string;

  @Property()
  private completed!: boolean;

  @Property({ name: 'user_id' })
  public userId!: string;

  // ✅ String reference - MikroORM handles discovery properly
  @ManyToOne('User', { 
    fieldName: 'user_id',
    persist: false 
  })
  public user!: User;

  // Public constructor for MikroORM compatibility
  constructor(props?: TodoProps) {
    if (props) {
      if (props.id !== undefined) {
        this.id = props.id; // Only set if provided (database reconstruction)
      }
      this.content = props.content;
      this.completed = props.completed;
      this.userId = props.userId;
    }
  }

  // Factory method for creating new todos
  static create(content: string, userId: string): Todo {
    // Domain validation
    if (content.length < 4) {
      throw new InputParseError('Todo must be at least 4 characters');
    }

    if (content.length > 500) {
      throw new InputParseError('Todo cannot exceed 500 characters');
    }

    if (!userId || userId.trim().length === 0) {
      throw new InputParseError('User ID is required');
    }

    return new Todo({
      // ✅ Don't set id - let database auto-increment
      content: content.trim(),
      completed: false,
      userId,
    });
  }

  // Static method for database reconstruction
  static fromDatabase(data: {
    id: number;
    content: string;
    completed: boolean;
    user_id: string;
  }): Todo {
    return new Todo({
      id: data.id,
      content: data.content,
      completed: data.completed,
      userId: data.user_id,
    });
  }

  // Business logic: Toggle completion status
  toggle(requestingUserId: string): void {
    this.ensureOwnership(requestingUserId);
    this.completed = !this.completed;
  }

  // Business logic: Update content
  updateContent(newContent: string, requestingUserId: string): void {
    this.ensureOwnership(requestingUserId);

    if (newContent.length < 4) {
      throw new InputParseError('Todo must be at least 4 characters');
    }

    if (newContent.length > 500) {
      throw new InputParseError('Todo cannot exceed 500 characters');
    }

    this.content = newContent.trim();
  }

  // Business logic: Mark as completed
  markCompleted(requestingUserId: string): void {
    this.ensureOwnership(requestingUserId);
    this.completed = true;
  }

  // Business logic: Mark as incomplete
  markIncomplete(requestingUserId: string): void {
    this.ensureOwnership(requestingUserId);
    this.completed = false;
  }

  // Business logic: Check if user can delete this todo
  canBeDeletedBy(requestingUserId: string): boolean {
    return this.userId === requestingUserId;
  }

  // Private method to ensure ownership
  private ensureOwnership(requestingUserId: string): void {
    if (this.userId !== requestingUserId) {
      throw new UnauthorizedError('You can only modify your own todos');
    }
  }

  // Getters for external access
  getId(): number {
    return this.id!; // ✅ Will be set after database persistence
  }

  getContent(): string {
    return this.content;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  getUserId(): string {
    return this.userId;
  }

  // 🎯 Navigation Property Getter (Lazy Loading)
  getUser(): User {
    return this.user;
  }

  // Domain query methods
  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  getStatus(): 'completed' | 'pending' {
    return this.completed ? 'completed' : 'pending';
  }

  // For serialization (when returning to client)
  toJSON() {
    return {
      id: this.id!, // ✅ Will be set after database persistence
      content: this.content,
      completed: this.completed,
      userId: this.userId,
    };
  }
} 