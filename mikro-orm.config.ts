import { defineConfig } from '@mikro-orm/postgresql';
import { MemoryCacheAdapter } from '@mikro-orm/core';
import { User } from './src/entities/models/user.entity';
import { Todo } from './src/entities/models/todo.entity';
import { Session } from './src/entities/models/session.entity';

export default defineConfig({
  entities: [User, Todo, Session],
  
  // Use DATABASE_URL for Supabase connection
  clientUrl: process.env.DATABASE_URL,
  
  // ✅ Use memory cache for serverless environments (Vercel)
  metadataCache: {
    adapter: MemoryCacheAdapter,
  },
  
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
  forceUndefined: true,
  
  // Use ReflectMetadataProvider for serverless compatibility
  metadataProvider: require('@mikro-orm/reflection').ReflectMetadataProvider,
}); 