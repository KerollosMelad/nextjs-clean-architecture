import { Session } from '../../../../entities';

export interface ISessionRepository {
  // Core session operations
  findById(sessionId: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  save(session: Session): Promise<void>;
  create(session: Session): Promise<Session>;
  delete(sessionId: string): Promise<void>;
  
  // Session management
  findActiveBySessionId(sessionId: string): Promise<Session | null>;
  findActiveByUserId(userId: string): Promise<Session[]>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllUserSessions(userId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<number>;
  
  // Validation
  exists(sessionId: string): Promise<boolean>;
  isValidSession(sessionId: string): Promise<boolean>;
  
  // Advanced queries with relationships
  findActiveSessionWithUser(sessionId: string): Promise<Session | null>;
} 