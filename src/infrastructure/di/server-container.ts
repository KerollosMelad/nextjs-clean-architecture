// This file is server-only and won't be bundled on the client
import 'server-only';
import 'reflect-metadata';
import { EntityManager } from '@mikro-orm/core';
import { registerDatabase, createRequestContainer, closeDatabase, INFRASTRUCTURE_TOKENS } from './database/database.module';
import { registerServices, SERVICE_TOKENS } from '../services/services.di';
import { registerRepositories, REPOSITORY_TOKENS } from '../repositories/repositories.di';
import { registerUserModule, registerTodoModule, USER_APPLICATION_TOKENS, TODO_APPLICATION_TOKENS } from '../../application/modules';
import { container } from 'tsyringe';

// Track initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Server-side container initialization
export async function initializeServerContainer(): Promise<void> {
  if (isInitialized) {
    return;
  }
  
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    console.log('[DI] Initializing server dependency injection container...');
    
    // Initialize database and register MikroORM
    await registerDatabase();
    
    // Register all services
    registerServices();
    
    // Register all repositories
    registerRepositories();
    
    // Register application modules
    registerUserModule();
    registerTodoModule();
    
    isInitialized = true;
    console.log('[DI] Server container initialization completed successfully');
  })();
  
  return initializationPromise;
}

// ✅ Request-scoped injection with guaranteed EntityManager cleanup
export async function withRequestScoped<T>(
  callback: (getService: <S>(token: string) => S) => Promise<T>
): Promise<T> {
  if (!isInitialized) {
    await initializeServerContainer();
  }
  
  // Create request-scoped container with fresh EntityManager
  const requestContainer = createRequestContainer();
  const em = requestContainer.resolve<EntityManager>(INFRASTRUCTURE_TOKENS.EntityManager);
  
  console.log('[DI] Request-scoped container created with fresh EntityManager');
  
  try {
    // Provide service resolver to callback
    const getService = <S>(token: string): S => {
      console.log(`[DI] Resolving token with request scope: ${token}`);
      return requestContainer.resolve<S>(token);
    };
    
    // Execute the callback
    const result = await callback(getService);
    
    console.log('[DI] Request completed successfully');
    return result;
    
  } finally {
    // ✅ ALWAYS cleanup EntityManager to release connection
    em.clear();
    console.log('[DI] EntityManager cleared - connection released to pool');
  }
}

// Export tokens for server-side DI setup (internal use)
export { SERVICE_TOKENS };
export { REPOSITORY_TOKENS };
export { INFRASTRUCTURE_TOKENS };

// Combine application tokens from all modules for server actions
export const APPLICATION_TOKENS = {
  ...USER_APPLICATION_TOKENS,
  ...TODO_APPLICATION_TOKENS,
} as const; 