import { injectable, inject } from 'tsyringe';
import { EntityManager } from '@mikro-orm/core';
import { Session } from '../../entities';
import type { ISessionRepository } from '../../application/modules';
import { INFRASTRUCTURE_TOKENS } from '../di/database/database.module';

@injectable()
export class SessionRepository implements ISessionRepository {
  constructor(
    @inject(INFRASTRUCTURE_TOKENS.EntityManager) private readonly em: EntityManager
  ) {}

  // Core session operations
  async findById(sessionId: string): Promise<Session | null> {
    return await this.em.findOne(Session, { id: sessionId } as any);
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return await this.em.find(Session, { user_id: userId } as any);
  }

  async save(session: Session): Promise<void> {
    this.em.persist(session); // ✅ Just persist, don't flush (Unit of Work pattern)
  }

  async create(session: Session): Promise<Session> {
    this.em.persist(session); // ✅ Just persist, don't flush (Unit of Work pattern)
    return session;
  }

  async delete(sessionId: string): Promise<void> {
    const session = await this.findById(sessionId);
    if (session) {
      this.em.remove(session); // ✅ Just remove, don't flush (Unit of Work pattern)
    }
  }

  // Session management
  async findActiveBySessionId(sessionId: string): Promise<Session | null> {
    const now = new Date();
    return await this.em.findOne(Session, {
      id: sessionId,
      expiresAt: { $gte: now }
    } as any);
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    const now = new Date();
    return await this.em.find(Session, {
      user_id: userId,
      expiresAt: { $gte: now }
    } as any);
  }

  async invalidateSession(sessionId: string): Promise<void> {
    const session = await this.findById(sessionId);
    if (session) {
      // Set expiration to past date to invalidate
      session.expire();
      await this.save(session);
    }
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.findActiveByUserId(userId);
    for (const session of sessions) {
      session.expire();
      await this.save(session);
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    const expiredSessions = await this.em.find(Session, {
      expiresAt: { $lt: now }
    } as any);

    if (expiredSessions.length > 0) {
      this.em.remove(expiredSessions); // ✅ Just remove, don't flush (Unit of Work pattern)
    }

    return expiredSessions.length;
  }

  // Validation
  async exists(sessionId: string): Promise<boolean> {
    const count = await this.em.count(Session, { id: sessionId } as any);
    return count > 0;
  }

  async isValidSession(sessionId: string): Promise<boolean> {
    const session = await this.findActiveBySessionId(sessionId);
    return session !== null;
  }

  // 🎯 Advanced session queries with navigation properties
  async findActiveSessionWithUser(sessionId: string): Promise<Session | null> {
    const session = await this.findActiveBySessionId(sessionId);
    if (session) {
      // Populate the user relationship
      await this.em.populate(session, ['user']);
    }
    return session;
  }

  async getUserActiveSessionsCount(userId: string): Promise<number> {
    const now = new Date();
    return await this.em.count(Session, {
      user_id: userId,
      expiresAt: { $gte: now }
    } as any);
  }
} 