export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry first
    await import('./sentry.server.config');
    
    // ✅ Claude's Solution: Initialize MikroORM directly in instrumentation
    try {
      const { MikroORM } = await import('@mikro-orm/core');
      const config = await import('./mikro-orm.config');
      
      console.log('🔧 [Instrumentation] Initializing MikroORM...');
      
      const orm = await MikroORM.init({
        ...config.default,
        // ✅ Force Vercel-optimized settings in instrumentation
        metadataCache: { enabled: false },
        forceEntityConstructor: false,
        discovery: { 
          warnWhenNoEntities: false,
          requireEntitiesArray: true,
        },
      });
      
      // Store ORM instance globally for DI container
      (global as any).orm = orm;
      console.log('✅ [Instrumentation] MikroORM initialized successfully');
      
      // Initialize DI container after ORM is ready
      const { initializeServerContainer } = await import('./src/infrastructure/di/server-container');
      await initializeServerContainer();
      
    } catch (error) {
      console.error('❌ [Instrumentation] Failed to initialize MikroORM:', error);
      // Still try to initialize DI container as fallback
      const { initializeServerContainer } = await import('./src/infrastructure/di/server-container');
      await initializeServerContainer();
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
