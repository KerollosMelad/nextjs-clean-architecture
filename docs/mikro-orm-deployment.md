# MikroORM Deployment on Vercel

## Problem
MikroORM uses `ts-morph` to read TypeScript source files for entity discovery, which fails in Vercel's serverless environment. This causes errors like:

```
Entity 'Todo' was not discovered, please make sure to provide it in 'entities' array when initializing the ORM
```

## Solution: Pre-built Metadata Cache

We've implemented MikroORM's recommended solution for serverless deployment using `GeneratedCacheAdapter`.

### How it works:
1. **Development**: Uses `MemoryCacheAdapter` for normal entity discovery
2. **Production**: Uses `GeneratedCacheAdapter` with pre-built metadata cache
3. **Next.js Config**: Uses `serverComponentsExternalPackages` to treat MikroORM as external

### Setup Steps:

#### 1. Generate Cache Before Deployment
```bash
npm run cache:generate
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