# Vercel Debugging Guide: MikroORM Entity Discovery

This guide helps you debug and resolve MikroORM "Entity was not discovered" errors on Vercel deployments.

## 🚀 Quick Debug Steps

### 1. **Clear Vercel Cache** (Most Important First Step)
```bash
# In Vercel Dashboard:
# 1. Go to your project
# 2. Settings → Functions
# 3. Click "Clear All Cache"
# 4. Redeploy

# Or via CLI:
vercel --prod --force
```

### **🆘 Emergency Workaround: Disable Cache**
If entity discovery still fails, temporarily disable the cache:

```bash
# In Vercel Dashboard, add environment variable:
MIKRO_ORM_DISABLE_CACHE=true

# This forces runtime entity discovery (slower but works)
```

### 2. **Use Debug Endpoint**
After deployment, visit: `https://your-app.vercel.app/api/debug`

This will show:
- Environment variables
- Cache file status
- Entity import status
- File system state

### 3. **Check Vercel Function Logs**
```bash
# Real-time logs
vercel logs --follow

# Or in Vercel Dashboard:
# Project → Functions → View Function Logs
```

## 🔧 Debugging Checklist

### ✅ **Build Process**
- [ ] Cache generation runs successfully during build
- [ ] `temp/metadata.json` is created and included in deployment
- [ ] No TypeScript compilation errors
- [ ] All entities are discovered during cache generation

### ✅ **Configuration**
- [ ] `vercel.json` uses correct build command (`build:vercel`)
- [ ] Environment variables are set in Vercel Dashboard
- [ ] `NODE_ENV=production` and `VERCEL=1` are set
- [ ] Database URL is correctly configured

### ✅ **Entity Discovery**
- [ ] Entities use direct imports (not `entitiesDirs`)
- [ ] String references in relationships (`@ManyToOne('User')`)
- [ ] Foreign keys properly linked with `fieldName`
- [ ] Type-only imports to avoid circular dependencies

### ✅ **Cache System**
- [ ] Cache file exists and has content
- [ ] `GeneratedCacheAdapter` used in production
- [ ] `disableDynamicFileAccess: true` in production
- [ ] Fallback to empty cache if file missing

## 🐛 Common Issues & Solutions

### **Issue: "Entity was not discovered"**
**Symptoms:** 
- Works locally but fails on Vercel
- Error mentions specific entity name like `Entity 'Todo' was not discovered`
- Cache generation succeeds but runtime fails
- Logs show entity constructors as single letters: `'H', 'K', 'q'`

**Root Cause:**
Vercel's minification changes entity class names (`User` → `H`) but cache/relationships still expect original names.

**Solutions:**
1. **Clear all caches** (Vercel + local)
   ```bash
   npm run cache:clear
   vercel --prod --force
   ```

2. **Emergency workaround - Disable cache**
   ```bash
   # Set in Vercel environment variables:
   MIKRO_ORM_DISABLE_CACHE=true
   ```

3. **Check entity imports in config**
   ```typescript
   // ✅ Good: Direct imports
   import { User, Todo, Session } from './src/entities';
   entities: [User, Todo, Session]
   
   // ❌ Bad: String paths
   entitiesDirs: ['./src/entities']
   ```

4. **Verify foreign key definitions**
   ```typescript
   // ✅ Good: Linked FK
   @Property({ name: 'user_id' })
   userId!: string;
   
   @ManyToOne('User', { fieldName: 'user_id' })
   user!: User;
   ```

### **Issue: Cache file not found**
**Symptoms:**
- Debug endpoint shows `cache.exists: false`
- Build logs show cache generation but runtime doesn't find it

**Solutions:**
1. **Check build command**
   ```json
   // vercel.json
   {
     "buildCommand": "npm run build:vercel"
   }
   ```

2. **Verify cache generation**
   ```bash
   # Should run during build
   npm run build:vercel
   ```

3. **Check file inclusion**
   ```bash
   # Cache should be in deployment
   ls -la temp/metadata.json
   ```

### **Issue: Circular dependency errors**
**Symptoms:**
- Build fails with circular dependency errors
- Entities can't be imported

**Solutions:**
1. **Use type-only imports**
   ```typescript
   // ✅ Good: Type-only import
   import type { User } from '../types';
   
   // ❌ Bad: Value import
   import { User } from './user.entity';
   ```

2. **Use string references**
   ```typescript
   // ✅ Good: String reference
   @ManyToOne('User', { fieldName: 'user_id' })
   
   // ❌ Bad: Function reference
   @ManyToOne(() => User, { fieldName: 'user_id' })
   ```

## 📊 Debug Information

### **Environment Variables to Check**
```bash
NODE_ENV=production
VERCEL=1
DATABASE_URL=postgresql://...
```

### **Key Log Messages to Look For**

**✅ Good logs (working correctly):**
```
🔧 MikroORM Config Loading: { isProduction: true, isVercel: true }
📁 Cache Status: { cacheExists: true, size: 2707 }
✅ Cache loaded successfully, entities: [ 'User', 'Todo', 'Session' ]
🔍 MikroORM: [discovery] - entity discovery finished, found 3 entities
```

**❌ Problem logs (minification issue):**
```
🏗️ Entities: { userConstructor: 'H', todoConstructor: 'K', sessionConstructor: 'q' }
MetadataError: Entity 'Todo' was not discovered (used in H.todos)
```

**🔄 Fallback logs (cache disabled):**
```
🔧 MikroORM Config Loading: { forceDisableCache: true }
🔄 Falling back to runtime discovery
```

### **Vercel Function Timeout**
- Functions have 10s timeout by default
- Database connections may be slow on cold starts
- Consider increasing timeout in `vercel.json`:
  ```json
  {
    "functions": {
      "app/api/**/*.ts": {
        "maxDuration": 30
      }
    }
  }
  ```

## 🚀 Deployment Best Practices

### **1. Pre-deployment Testing**
```bash
# Test locally with production settings
NODE_ENV=production npm run build:vercel

# Verify cache generation
ls -la temp/metadata.json

# Test with production config
NODE_ENV=production npm run dev
```

### **2. Deployment Process**
```bash
# Clear local cache
npm run cache:clear

# Build with cache generation (includes minification fixes)
npm run build:vercel

# Deploy with force flag to clear Vercel cache
vercel --prod --force
```

**If deployment still fails with entity discovery errors:**
```bash
# Set emergency fallback in Vercel Dashboard:
# Environment Variables → MIKRO_ORM_DISABLE_CACHE = true
# Then redeploy

# This bypasses cache and uses runtime discovery
```

### **3. Post-deployment Verification**
```bash
# Check debug endpoint
curl https://your-app.vercel.app/api/debug

# Test entity operations
curl -X POST https://your-app.vercel.app/api/todos \
  -H "Content-Type: application/json" \
  -d '{"content":"Test todo"}'

# Check function logs
vercel logs --follow
```

## 📞 Getting Help

1. **Check Vercel function logs** for detailed error messages
2. **Use the debug endpoint** to understand the runtime environment
3. **Compare debug output** between local and production
4. **Verify cache file** exists and has the correct content
5. **Test with a simple entity** to isolate the issue

Remember: **Cache clearing** solves 80% of entity discovery issues on Vercel! 