import { defineConfig } from '@mikro-orm/postgresql';
import { MemoryCacheAdapter, GeneratedCacheAdapter } from '@mikro-orm/core';
import { User, Todo, Session } from './src/entities';

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

console.log('🔧 MikroORM Config Loading:', {
  NODE_ENV: process.env.NODE_ENV,
  isProduction,
  isVercel,
  DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
  cacheDir: './temp',
  cacheFile: './temp/metadata.json'
});

// Check if cache file exists
const fs = require('fs');
const path = require('path');
const cacheFilePath = path.join(process.cwd(), 'temp', 'metadata.json');
const cacheExists = fs.existsSync(cacheFilePath);

console.log('📁 Cache Status:', {
  cacheFilePath,
  cacheExists,
  workingDirectory: process.cwd()
});

if (cacheExists) {
  try {
    const cacheStats = fs.statSync(cacheFilePath);
    console.log('📊 Cache File Info:', {
      size: cacheStats.size,
      modified: cacheStats.mtime.toISOString()
    });
  } catch (error) {
    console.error('❌ Cache file stat error:', error);
  }
}

// Log entities being imported
console.log('🏗️ Entities:', {
  User: typeof User,
  Todo: typeof Todo,
  Session: typeof Session,
  userConstructor: User.name,
  todoConstructor: Todo.name,
  sessionConstructor: Session.name
});

export default defineConfig({
  // Direct entity imports (not entitiesDirs)
  entities: [User, Todo, Session],
  
  // ✅ Production: Use pre-built cache, Development: Use memory cache
  metadataCache: {
    enabled: true,
    adapter: isProduction && cacheExists ? GeneratedCacheAdapter : MemoryCacheAdapter,
    options: isProduction && cacheExists ? {
      data: (() => {
        try {
          return require('./temp/metadata.json');
        } catch (error) {
          console.error('❌ Failed to load cache file:', error);
          return {};
        }
      })()
    } : {},
  },

  // ✅ Serverless-optimized discovery settings
  discovery: {
    warnWhenNoEntities: false,
    requireEntitiesArray: true,
    disableDynamicFileAccess: isProduction,
    alwaysAnalyseProperties: false,
  },

  // Use DATABASE_URL for connection
  clientUrl: process.env.DATABASE_URL,
  
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

  // SSL configuration for Supabase (REQUIRED)
  driverOptions: {
    connection: {
      ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { 
        rejectUnauthorized: false,
        sslmode: 'require'
      } : false,
      connect_timeout: 10,
      application_name: 'nextjs_clean_architecture',
    },
  },
  
  // Enhanced logging for debugging
  debug: !isProduction || isVercel, // Enable debug logs on Vercel
  logger: (message) => {
    if (message.includes('discovery') || message.includes('entity') || message.includes('cache')) {
      console.log('🔍 MikroORM:', message);
    }
  },
  
  migrations: {
    path: './src/infrastructure/migrations',
    pathTs: './src/infrastructure/migrations',
  },

  // Ensure connection is closed properly for serverless
  forceUndefined: true,
  
  // ✅ Use ReflectMetadataProvider for serverless compatibility
  metadataProvider: require('@mikro-orm/reflection').ReflectMetadataProvider,
}); 