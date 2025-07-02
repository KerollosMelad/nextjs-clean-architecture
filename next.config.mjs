import { withSentryConfig } from '@sentry/nextjs';
import webpack from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    // Exclude MikroORM and database-related modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        util: false,
        url: false,
        querystring: false,
        punycode: false,
        http: false,
        https: false,
        zlib: false,
        child_process: false,
      };

      // Exclude server-only modules from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        '@mikro-orm/core': 'commonjs @mikro-orm/core',
        '@mikro-orm/postgresql': 'commonjs @mikro-orm/postgresql',
        '@mikro-orm/reflection': 'commonjs @mikro-orm/reflection',
        '@mikro-orm/migrations': 'commonjs @mikro-orm/migrations',
        '@mikro-orm/knex': 'commonjs @mikro-orm/knex',
        'pg-native': 'commonjs pg-native',
        'pg': 'commonjs pg',
        'ts-morph': 'commonjs ts-morph',
        'tsyringe': 'commonjs tsyringe',
        'libsql': 'commonjs libsql',
        'mariadb': 'commonjs mariadb',
        'mariadb/callback': 'commonjs mariadb/callback',
      });

      // Exclude all @libsql modules from client bundle
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^@libsql\//,
        })
      );
    }

    // Ignore optional dependencies that cause warnings
    config.externals.push('pg-native');
    config.externals.push('@libsql/win32-x64-msvc');
    config.externals.push('libsql');
    config.externals.push('mariadb');
    config.externals.push('mariadb/callback');

    return config;
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'sentry-devrel',
  project: 'clean-arch',

  // An auth token is required for uploading source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
