import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import type { User } from '../types';

export interface SessionProps {
  id: string;
  userId: string;
  expiresAt: Date;
}

@Entity()
export class Session {
  @PrimaryKey()
  private id!: string;

  @Property({ name: 'user_id' })
  private userId!: string;

  @Property({ name: 'expires_at' })
  private expiresAt!: Date;

  // ✅ String reference with properly linked FK
  @ManyToOne('User', { 
    fieldName: 'user_id',
    persist: false 
  })
  public user!: User;

  // Private constructor to enforce factory methods
  private constructor(props: SessionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.expiresAt = props.expiresAt;
  }

  // Factory method for creating new sessions
  static create(id: string, userId: string, expiresAt: Date): Session {
    // Domain validation
    if (!id || id.trim().length === 0) {
      throw new Error('Session ID is required');
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (expiresAt <= new Date()) {
      throw new Error('Session expiration must be in the future');
    }

    return new Session({
      id: id.trim(),
      userId: userId.trim(),
      expiresAt,
    });
  }

  // Static method for database reconstruction
  static fromDatabase(data: {
    id: string;
    user_id: string;
    expires_at: Date;
  }): Session {
    return new Session({
      id: data.id,
      userId: data.user_id,
      expiresAt: data.expires_at,
    });
  }

  // Business logic: Check if session is valid
  isValid(): boolean {
    return this.expiresAt > new Date();
  }

  // Business logic: Check if session is expired
  isExpired(): boolean {
    return this.expiresAt <= new Date();
  }

  // Business logic: Extend session
  extend(additionalHours: number = 24): void {
    const now = new Date();
    const newExpiry = new Date(now.getTime() + (additionalHours * 60 * 60 * 1000));
    this.expiresAt = newExpiry;
  }

  // Business logic: Expire session (set expiration to past)
  expire(): void {
    this.expiresAt = new Date(Date.now() - 1000); // 1 second ago
  }

  // Business logic: Check if session belongs to user
  belongsTo(userId: string): boolean {
    return this.userId === userId;
  }

  // Business logic: Get time until expiration in minutes
  getTimeUntilExpiration(): number {
    const now = new Date();
    const diffMs = this.expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60))); // minutes
  }

  // Business logic: Check if session expires soon (within 1 hour)
  expiresSoon(): boolean {
    return this.getTimeUntilExpiration() <= 60;
  }

  // Getters for external access
  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getUser(): User {
    return this.user;
  }

  // For serialization
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      expiresAt: this.expiresAt.toISOString(),
    };
  }
} 