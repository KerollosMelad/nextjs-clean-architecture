import 'reflect-metadata';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry
    await import('./sentry.server.config');
    
    // Initialize DI container and database (server-side only)
    const { initializeServerContainer } = await import('./src/infrastructure/di/server-container');
    await initializeServerContainer();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
