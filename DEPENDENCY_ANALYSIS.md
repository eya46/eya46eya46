# Package.json Dependencies Analysis Report

## Summary

This document analyzes the non-dev dependencies in package.json and provides corrections for proper dependency categorization.

## Changes Made

### Moved from `dependencies` to `devDependencies`:

1. **@astrojs/sitemap** - Only needed during build time for sitemap generation
2. **tailwindcss** - Only needed during build time for CSS processing
3. **@tailwindcss/vite** - Only needed during build time as a Vite plugin

### Kept in `dependencies` (Production Runtime Required):

1. **astro** - Core framework required for server-side rendering
2. **@astrojs/node** - Node.js adapter required for production deployment
3. **url-join** - Utility library used in runtime server code

## Reasoning

### Build-time vs Runtime Dependencies

- **Build-time dependencies** are only needed during the build process and should be in `devDependencies`
- **Runtime dependencies** are needed when the application runs in production and must be in `dependencies`

### Analysis Details

#### @astrojs/sitemap
- **Usage**: Configured in astro.config.mjs
- **Purpose**: Generates sitemap-index.xml and sitemap-0.xml during build
- **Runtime**: Not required - sitemap files are static assets
- **Decision**: Moved to devDependencies ✅

#### tailwindcss & @tailwindcss/vite
- **Usage**: CSS framework and Vite plugin
- **Purpose**: Processes and generates CSS during build (index.CekyePcE.css)
- **Runtime**: Not required - CSS is compiled to static files
- **Decision**: Moved to devDependencies ✅

#### astro
- **Usage**: Core framework throughout the application
- **Purpose**: Server-side rendering, routing, and core functionality
- **Runtime**: Required for production server
- **Decision**: Kept in dependencies ✅

#### @astrojs/node
- **Usage**: Server adapter configured in astro.config.mjs
- **Purpose**: Enables Node.js deployment mode
- **Runtime**: Required for production server (dist/server/entry.mjs)
- **Decision**: Kept in dependencies ✅

#### url-join
- **Usage**: Used in src/utils/halo.ts and src/components/Posts.astro
- **Purpose**: URL construction utility
- **Runtime**: Required for server-side operations
- **Decision**: Kept in dependencies ✅

## Verification

1. **Build Test**: ✅ Application builds successfully with new dependency structure
2. **Development Test**: ✅ All dev features work correctly
3. **Production Test**: ✅ Production server runs with `--omit=dev` dependencies only
4. **Docker Compatibility**: ✅ Matches Dockerfile's `npm install --omit=dev` strategy

## Benefits

1. **Smaller Production Installs**: Reduces production bundle size by ~223 packages
2. **Clearer Dependency Management**: Better separation of concerns
3. **Improved CI/CD**: Faster production builds and deployments
4. **Docker Optimization**: Aligned with multi-stage Docker build strategy

## Before vs After

### Before:
- Production dependencies: 6 packages
- Contains build-time tools in production bundle

### After:
- Production dependencies: 3 packages (50% reduction)
- Clean separation of build-time and runtime dependencies

This optimization improves the project's dependency management while maintaining full functionality.