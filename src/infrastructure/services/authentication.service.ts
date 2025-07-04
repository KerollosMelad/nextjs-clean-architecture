import { injectable, inject } from "tsyringe";
import { randomBytes } from "crypto";
import { SESSION_COOKIE } from "../../../config";
import { IAuthenticationService } from "../../application/modules/user/interfaces/authentication.service.interface";
import type { ISessionRepository, IUserRepository } from "../../application/modules";
import { REPOSITORY_TOKENS } from "../repositories/repositories.di";
import { User } from "../../entities/models/user.entity";
import { Session } from "../../entities/models/session.entity";
import { Cookie } from "../../entities/models/cookie";

@injectable()
export class AuthenticationService implements IAuthenticationService {
  constructor(
    @inject(REPOSITORY_TOKENS.ISessionRepository) 
    private readonly sessionRepo: ISessionRepository,
    @inject(REPOSITORY_TOKENS.IUserRepository) 
    private readonly userRepo: IUserRepository,
  ) {}

  private generateId(length: number): string {
    const bytes = randomBytes(Math.ceil(length * 3 / 4));
    return bytes.toString("base64url").slice(0, length);
  }

  generateUserId(): string {
    return this.generateId(15);
  }

  generateSessionId(): string {
    return this.generateId(40);
  }

  async createSession(user: User): Promise<{
    session: Session;
    cookie: Cookie;
  }> {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const session = Session.create(sessionId, user.getId(), expiresAt);
    await this.sessionRepo.create(session);
    
    const cookie: Cookie = {
      name: SESSION_COOKIE,
      value: sessionId,
      attributes: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      },
    };

    return { session, cookie };
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.sessionRepo.invalidateSession(sessionId);
  }

  async validateSession(sessionId: string): Promise<{ user: User; session: Session } | null> {
    if (!sessionId || sessionId.length < 10) {
      return null;
    }

    try {
      const session = await this.sessionRepo.findActiveSessionWithUser(sessionId);
      
      if (!session || !session.isValid()) {
        return null;
      }

      const user = session.getUser();
      
      if (!user) {
        return null;
      }

      return { user, session };
    } catch (error) {
      console.error("[AUTH] Session validation error:", error);
      return null;
    }
  }
}
