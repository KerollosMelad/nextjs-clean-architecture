import { defineConfig } from '@mikro-orm/postgresql';
import { User } from './src/entities/models/user.entity';
import { Todo } from './src/entities/models/todo.entity';
import { Session } from './src/entities/models/session.entity';

export default defineConfig({
  entities: [User, Todo, Session],
  
  // Use DATABASE_URL for Supabase connection
  clientUrl: process.env.DATABASE_URL,
  
  // ✅ Serverless-optimized connection pool
  pool: {
    min: 0,              // ✅ No minimum connections (serverless-friendly)
    max: 5,              // ✅ Lower max for Supabase (avoid overwhelming)
    acquireTimeoutMillis: 60000,  // ✅ Longer timeout for serverless cold starts
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,     // ✅ Aggressive cleanup of idle connections
    createRetryIntervalMillis: 200,
    idleTimeoutMillis: 10000,     // ✅ Shorter idle timeout (10s)
  },
  
  // SSL configuration for Supabase (REQUIRED)
  driverOptions: {
    connection: {
      ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { 
        rejectUnauthorized: false,
        sslmode: 'require'
      } : false,
      // Add connection timeout for Supabase
      connect_timeout: 10,
      application_name: 'nextjs_clean_architecture',
    },
  },
  
  // Development settings
  debug: process.env.NODE_ENV === 'development',
  
  // Migration settings
  migrations: {
    path: './src/infrastructure/migrations',
    pathTs: './src/infrastructure/migrations',
  },
  
  // Ensure connection is closed properly for serverless
  // forceUndefined: true, // We'll rely on cache and proper ORM lifecycle management.
  
  // Cache configuration: enabled for production, uses FileCacheAdapter.
  // The cache is generated during the build step.
  cache: {
    enabled: process.env.NODE_ENV === 'production',
    pretty: false,
    adapter: require('@mikro-orm/core').FileCacheAdapter,
    options: { cacheDir: './temp' } // Ensures consistency with Vercel logs
  },

  // Metadata provider: TsMorph for development (and cache generation),
  // ReflectMetadataProvider for production (as cache should be primary).
  // However, MikroORM automatically uses cache if `cache.enabled` is true and cache exists.
  // TsMorph is needed for `cache:generate` which runs with NODE_ENV=production.
  metadataProvider: require('@mikro-orm/reflection').TsMorphMetadataProvider,

  // Explicitly declare entities (already done, which is good)
  // entities: [User, Todo, Session], // This is already present and correct
}); 