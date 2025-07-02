import { container } from 'tsyringe';
import { MikroORM, EntityManager } from '@mikro-orm/core';
import config from '../../../../mikro-orm.config';
import fs from 'fs';
import path from 'path';

// Infrastructure component tokens
export const INFRASTRUCTURE_TOKENS = {
  MikroORM: 'MikroORM',
  EntityManager: 'EntityManager',
} as const;

// Global ORM instance
let orm: MikroORM;

export async function registerDatabase(): Promise<void> {
  // In production (Vercel runtime), copy pre-generated cache to writable /tmp location
  if (process.env.NODE_ENV === 'production') {
    const buildCachePath = path.join(process.cwd(), '.next', 'server', 'mikro-orm-cache', 'metadata.json');
    // VERCEL_ENV might be more specific if NODE_ENV isn't 'production' during some Vercel phases
    // but config.metadataCache.options.cacheDir is already using NODE_ENV, so we align with that.
    const runtimeCacheDir = '/tmp/mikro-orm-cache';
    const buildCacheDir = path.join(process.cwd(), '.next', 'server', 'mikro-orm-cache');
    // const runtimeCacheDir = '/tmp/mikro-orm-cache'; // Redundant declaration removed

    try {
      if (fs.existsSync(buildCacheDir)) {
        console.log(`[MikroORM] Found build cache directory at ${buildCacheDir}`);
        if (!fs.existsSync(runtimeCacheDir)) {
          fs.mkdirSync(runtimeCacheDir, { recursive: true });
          console.log(`[MikroORM] Created runtime cache directory ${runtimeCacheDir}`);
        }

        const cacheFiles = fs.readdirSync(buildCacheDir);
        if (cacheFiles.length === 0) {
          console.warn(`[MikroORM] Build cache directory ${buildCacheDir} is empty. ORM will use discovery.`);
        } else {
          for (const fileName of cacheFiles) {
            const srcPath = path.join(buildCacheDir, fileName);
            const destPath = path.join(runtimeCacheDir, fileName);
            fs.copyFileSync(srcPath, destPath);
            console.log(`[MikroORM] Copied cache file ${fileName} to ${destPath}`);
          }
          console.log(`[MikroORM] All cache files copied to ${runtimeCacheDir}`);
        }
      } else {
        console.warn(`[MikroORM] Build cache directory not found at ${buildCacheDir}. ORM will use discovery.`);
      }
    } catch (error) {
      console.error('[MikroORM] Error copying cache files for production:', error);
      // Proceed without cache if copying fails, ORM will use discovery.
    }
  }

  // Initialize MikroORM
  orm = await MikroORM.init(config);
  
  // Register ORM instance
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
