import { defineConfig } from '@mikro-orm/postgresql';
import { User } from './src/entities/models/user.entity';
import { Todo } from './src/entities/models/todo.entity';
import { Session } from './src/entities/models/session.entity';

export default defineConfig({
  // ✅ Direct entity references (not entitiesDirs)
  entities: [Todo, User, Session],
  
  // ✅ Connection
  clientUrl: process.env.DATABASE_URL,
  
  // ✅ Disable cache completely for Vercel compatibility
  metadataCache: {
    enabled: false,
  },
  
  // ✅ Disable force entity constructor to fix prototype issues
  forceEntityConstructor: false,
  
  // ✅ Simplified discovery settings
  discovery: {
    warnWhenNoEntities: false,
    requireEntitiesArray: true,
  },
  
  // ✅ SSL configuration for Supabase
  driverOptions: {
    connection: {
      ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { 
        rejectUnauthorized: false,
        sslmode: 'require'
      } : false,
    },
  },
  
  // ✅ Migrations configuration
  migrations: {
    path: './src/infrastructure/migrations',
    pathTs: './src/infrastructure/migrations',
  },
  
  // ✅ Serverless-optimized connection pool
  pool: {
    min: 0,
    max: 5,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
    idleTimeoutMillis: 10000,
  },
  
  // ✅ Enhanced debugging for Vercel
  debug: process.env.VERCEL === '1',
}); 