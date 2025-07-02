import { Cookie } from '../../../../entities/models/cookie';
import { Session } from '../../../../entities/models/session.entity';

export interface IAuthApplicationService {
  signUp(input: { username: string; password: string }): Promise<{
    session: Session;
    cookie: Cookie;
    user: { id: string; username: string };
  }>;

  signIn(input: { username: string; password: string }): Promise<{
    session: Session;
    cookie: Cookie;
    user: { id: string; username: string };
  }>;

  signOut(sessionId: string): Promise<void>;

  getUserIdFromSession(sessionId: string): Promise<string>;

  changePassword(input: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<void>;

  updateUsername(input: {
    userId: string;
    newUsername: string;
  }): Promise<{ id: string; username: string }>;
} 