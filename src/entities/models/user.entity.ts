import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { hash, compare } from 'bcrypt-ts';
import { AuthenticationError } from '../errors/auth';
import { InputParseError } from '../errors/common';
import type { Todo } from './todo.entity';
import type { Session } from './session.entity';

export interface UserProps {
  id: string;
  username: string;
  passwordHash: string;
}

@Entity()
export class User {
  @PrimaryKey()
  public id!: string;

  @Property()
  public username!: string;

  @Property({ name: 'password_hash' })
  public passwordHash!: string;

  // ✅ Use class references to avoid minification issues  
  @OneToMany(() => require('./todo.entity').Todo, 'user')
  public todos = new Collection<Todo>(this);

  @OneToMany(() => require('./session.entity').Session, 'user')  
  public sessions = new Collection<Session>(this);

  // Public constructor for MikroORM compatibility  
  constructor(props?: UserProps) {
    if (props) {
      this.id = props.id;
      this.username = props.username;
      this.passwordHash = props.passwordHash;
    }
  }

  // Factory method for creating new users
  static async create(
    id: string,
    username: string,
    password: string
  ): Promise<User> {
    // Domain validation
    if (username.length < 3 || username.length > 31) {
      throw new InputParseError('Username must be between 3 and 31 characters');
    }

    if (password.length < 6 || password.length > 255) {
      throw new InputParseError('Password must be between 6 and 255 characters');
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    return new User({
      id,
      username,
      passwordHash,
    });
  }

  // Static method for database reconstruction
  static fromDatabase(data: {
    id: string;
    username: string;
    password_hash: string;
  }): User {
    return new User({
      id: data.id,
      username: data.username,
      passwordHash: data.password_hash,
    });
  }

  // Business logic: Authenticate user
  async authenticate(password: string): Promise<boolean> {
    const isValid = await compare(password, this.passwordHash);
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials');
    }
    return true;
  }

  // Business logic: Check if user can create more todos
  canCreateTodo(currentTodoCount: number, maxTodos: number = 50): boolean {
    return currentTodoCount < maxTodos;
  }

  // Getters for external access
  getId(): string {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  // Domain behavior: Update username
  updateUsername(newUsername: string): void {
    if (newUsername.length < 3 || newUsername.length > 31) {
      throw new InputParseError('Username must be between 3 and 31 characters');
    }
    this.username = newUsername;
  }

  // Domain behavior: Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Verify current password
    await this.authenticate(currentPassword);

    // Validate new password
    if (newPassword.length < 6 || newPassword.length > 255) {
      throw new InputParseError('Password must be between 6 and 255 characters');
    }

    // Hash new password
    this.passwordHash = await hash(newPassword, 12);
  }
} 