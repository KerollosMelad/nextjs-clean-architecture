import { container } from 'tsyringe';
import { MikroORM, EntityManager } from '@mikro-orm/core';
import config from '../../../../mikro-orm.config';

// Infrastructure component tokens
export const INFRASTRUCTURE_TOKENS = {
  MikroORM: 'MikroORM',
  EntityManager: 'EntityManager',
} as const;

// Global ORM instance
let orm: MikroORM;

export async function registerDatabase(): Promise<void> {
  // ✅ Check if ORM was already initialized in instrumentation
  if ((global as any).orm) {
    console.log('🔄 [Database] Using ORM from instrumentation hook');
    orm = (global as any).orm;
  } else {
    console.log('🔧 [Database] Initializing new ORM instance');
    // Fallback: Initialize MikroORM here if not done in instrumentation
    orm = await MikroORM.init(config);
  }
  
  // Register ORM instance (used by createRequestContainer)
  container.register<MikroORM>(
    INFRASTRUCTURE_TOKENS.MikroORM,
    { useValue: orm }
  );
  
}

export function createRequestContainer(): typeof container {
  // Create child container for request scope  
  const requestContainer = container.createChildContainer();
  
  // ✅ Create ONE EntityManager fork per request and share it across all services
  const requestEntityManager = orm.em.fork();
  
  requestContainer.register<EntityManager>(
    INFRASTRUCTURE_TOKENS.EntityManager,
    { useValue: requestEntityManager } // ✅ Same instance for all services in this request
  );
  
  return requestContainer;
}
