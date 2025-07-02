import { Cookie } from '../../../../entities/models/cookie';
import { Session } from '../../../../entities/models/session.entity';
import { User } from '../../../../entities/models/user.entity';

export interface IAuthenticationService {
  generateUserId(): string;
  generateSessionId(): string;
  validateSession(sessionId: string): Promise<{ user: User; session: Session } | null>;
  createSession(user: User): Promise<{ session: Session; cookie: Cookie }>;
  invalidateSession(sessionId: string): Promise<void>;
}
