import { Cookie, Session, User } from '../../../../entities';

export interface IAuthenticationService {
  generateUserId(): string;
  generateSessionId(): string;
  validateSession(sessionId: string): Promise<{ user: User; session: Session } | null>;
  createSession(user: User): Promise<{ session: Session; cookie: Cookie }>;
  invalidateSession(sessionId: string): Promise<void>;
}
