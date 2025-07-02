# MikroORM Deployment on Vercel

## Problem
MikroORM uses `ts-morph` to read TypeScript source files for entity discovery, which fails in Vercel's serverless environment. This causes errors like:

```
Entity 'Todo' was not discovered, please make sure to provide it in 'entities' array when initializing the ORM
```

## Root Causes
1. **String References**: Using `@ManyToOne('User')` instead of `@ManyToOne(() => User)` 
2. **Dynamic File Access**: MikroORM trying to scan files at runtime in serverless environment
3. **Missing Metadata Cache**: No pre-built entity metadata for production

## Solution: Pre-built Metadata Cache

We've implemented MikroORM's recommended solution for serverless deployment using `GeneratedCacheAdapter`.

### How it works:
1. **Development**: Uses `MemoryCacheAdapter` for normal entity discovery
2. **Production**: Uses `GeneratedCacheAdapter` with pre-built metadata cache
3. **Next.js Config**: Uses `serverComponentsExternalPackages` to treat MikroORM as external

### Setup Steps:

#### 1. Use String References (CRITICAL)
Keep string references to avoid circular dependencies:

```typescript
// ✅ Correct (String references - avoid circular imports)
@ManyToOne('User', { persist: false })
@OneToMany('Todo', 'user')

// ❌ Avoid (Function references cause circular dependencies)  
@ManyToOne(() => User, { persist: false })
@OneToMany(() => Todo, 'user')
```

Use type imports to avoid circular dependencies:
```typescript
// ✅ Correct
import type { User } from '../types';

// ❌ Avoid (causes circular imports)
import { User } from './user.entity';
```

#### 2. Generate Cache Before Deployment
```bash
# Windows (PowerShell)
npm run cache:generate:win

# Linux/Mac  
DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npm run cache:generate
```

This creates `./temp/metadata.json` with all entity metadata.

#### 2. Deploy to Vercel
The `mikro-orm.config.ts` automatically:
- Uses direct entity imports (no glob patterns)
- Switches to `GeneratedCacheAdapter` in production  
- Disables dynamic file access in production
- Requires entities array (no discovery)

#### 3. Next.js Configuration
`next.config.mjs` includes:
```javascript
experimental: {
  serverComponentsExternalPackages: [
    '@mikro-orm/core',
    '@mikro-orm/postgresql',
    '@mikro-orm/reflection',
    // ... other MikroORM packages
  ],
}
```

### Deployment Workflow:

For production deployments:
1. Generate cache: `npm run cache:generate`
2. Commit the generated `temp/metadata.json`
3. Deploy to Vercel

For CI/CD:
```yaml
- name: Generate MikroORM Cache
  run: npm run cache:generate
  
- name: Deploy to Vercel
  run: vercel --prod
```

### Configuration Details:

The solution includes:
- ✅ Direct entity imports (no file scanning)
- ✅ Production metadata cache with fallback
- ✅ Serverless-optimized discovery settings
- ✅ Next.js external packages configuration
- ✅ Proper connection pooling for Vercel

This approach ensures reliable entity discovery in Vercel's serverless environment while maintaining development flexibility.

## ✅ Solution Summary

The complete working solution includes:

1. **String entity references** (avoid circular dependencies)
2. **Pre-built metadata cache** with `GeneratedCacheAdapter` 
3. **Next.js `serverComponentsExternalPackages`** for MikroORM
4. **Disabled dynamic file access** in production
5. **Direct entity imports** in mikro-orm.config.ts
6. **Type-only imports** in entity files

**Key insight**: The "Entity was not discovered" error was caused by the combination of missing metadata cache AND Next.js bundling issues, not just one factor. 