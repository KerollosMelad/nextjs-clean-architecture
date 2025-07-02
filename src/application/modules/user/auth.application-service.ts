import { injectable, inject } from 'tsyringe';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../../../entities/models/user.entity';
import { Session } from '../../../entities/models/session.entity';
import { Cookie } from '../../../entities/models/cookie';
import type { IUserRepository, IAuthApplicationService } from './interfaces';
import type { IAuthenticationService } from './interfaces/authentication.service.interface';
import { INFRASTRUCTURE_TOKENS } from '../../../infrastructure/di/database/database.module';
import { REPOSITORY_TOKENS } from '../../../infrastructure/repositories/repositories.di';
import { SERVICE_TOKENS } from '../../../infrastructure/services/services.di';
import { AuthenticationError } from '../../../entities/errors/auth';

@injectable()
export class AuthApplicationService implements IAuthApplicationService {
  constructor(
    @inject(INFRASTRUCTURE_TOKENS.EntityManager) private readonly em: EntityManager,
    @inject(REPOSITORY_TOKENS.IUserRepository) private readonly userRepository: IUserRepository,
    @inject(SERVICE_TOKENS.IAuthenticationService) private readonly authService: IAuthenticationService
  ) {}

  async signUp(input: {
    username: string;
    password: string;
  }): Promise<{
    session: Session;
    cookie: Cookie;
    user: { id: string; username: string };
  }> {
    // Check if username already exists
    const existingUser = await this.userRepository.findByUsername(input.username);
    if (existingUser) {
      throw new AuthenticationError('Username already taken');
    }

    // Generate new user ID
    const userId = this.authService.generateUserId();

    // Create user using domain logic (includes validation and password hashing)
    const user = await User.create(userId, input.username, input.password);

    // Save user to database (persists only, doesn't flush)
    await this.userRepository.create(user);

    // Create session using domain logic
    const { session, cookie } = await this.authService.createSession(user);

    console.log('[AUTH] Session created and persisted:', session.getId());

    // ✅ Single flush for entire operation (Unit of Work pattern)
    await this.em.flush();

    return {
      session,
      cookie,
      user: {
        id: user.getId(),
        username: user.getUsername(),
      },
    };
  }

  async signIn(input: {
    username: string;
    password: string;
  }): Promise<{
    session: Session;
    cookie: Cookie;
    user: { id: string; username: string };
  }> {
    // Get user by username
    const user = await this.userRepository.findByUsername(input.username);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Use domain logic to authenticate (includes password verification)
    await user.authenticate(input.password);

    // Create session using domain logic
    const { session, cookie } = await this.authService.createSession(user);

    console.log('[AUTH] Session created and persisted:', session.getId());

    // ✅ Single flush for entire operation (Unit of Work pattern)
    await this.em.flush();

    return {
      session,
      cookie,
      user: {
        id: user.getId(),
        username: user.getUsername(),
      },
    };
  }

  async signOut(sessionId: string): Promise<void> {
    // Invalidate session using authentication service
    await this.authService.invalidateSession(sessionId);

    console.log('[AUTH] Session invalidated and persisted:', sessionId);

    // ✅ Single flush for entire operation (Unit of Work pattern)
    await this.em.flush();
  }

  async getUserIdFromSession(sessionId: string): Promise<string> {
    // Validate session and get user
    const sessionData = await this.authService.validateSession(sessionId);
    
    if (!sessionData) {
      throw new AuthenticationError('Invalid or expired session');
    }

    return sessionData.user.getId();
  }

  async changePassword(input: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    // Get user
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Use domain logic to change password (includes validation and hashing)
    await user.changePassword(input.currentPassword, input.newPassword);

    // Save changes (persists only, doesn't flush)
    await this.userRepository.save(user);

    // ✅ Single flush for entire operation (Unit of Work pattern)
    await this.em.flush();
  }

  async updateUsername(input: {
    userId: string;
    newUsername: string;
  }): Promise<{ id: string; username: string }> {
    // Check if new username already exists
    const existingUser = await this.userRepository.findByUsername(input.newUsername);
    if (existingUser && existingUser.getId() !== input.userId) {
      throw new AuthenticationError('Username already taken');
    }

    // Get user
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Use domain logic to update username (includes validation)
    user.updateUsername(input.newUsername);

    // Save changes (persists only, doesn't flush)
    await this.userRepository.save(user);

    // ✅ Single flush for entire operation (Unit of Work pattern)
    await this.em.flush();

    return {
      id: user.getId(),
      username: user.getUsername(),
    };
  }
} 