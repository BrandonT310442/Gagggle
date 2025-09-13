# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.3 application using:
- React 19.1.0
- TypeScript 5
- Tailwind CSS v4
- App Router architecture

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Architecture

### Next.js App Router Structure
- `/app` directory contains the application routes and layouts
- `app/layout.tsx` - Root layout with Geist font configuration
- `app/page.tsx` - Home page component
- `app/globals.css` - Global Tailwind CSS styles

### Key Configuration
- TypeScript configured with strict mode in `tsconfig.json`
- Path alias `@/*` maps to root directory
- Tailwind CSS v4 with PostCSS configuration

### Styling
- Uses Tailwind CSS with custom configuration
- Geist and Geist Mono fonts from Google Fonts
- Dark mode support with automatic class switching