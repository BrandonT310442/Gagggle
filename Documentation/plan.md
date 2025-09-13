# Plan - Implementation Planning for Next.js Features

Creates a detailed implementation plan for features, issues, and enhancements in this Next.js application.

## Usage

- `/plan` - Creates implementation plan using understanding and requirements documents
- Typically called after analyzing the feature requirements and codebase context

## Process

### 1. Gather Context

**Required Input:**
- Feature/issue description and requirements
- Target components and pages affected
- Design specifications (if applicable)
- Performance and accessibility requirements

**Read and Analyze:**
- Examine existing Next.js app structure in `/app` directory
- Review current components and their patterns
- Check existing API routes and data fetching patterns
- Identify Tailwind CSS utility patterns in use
- Analyze TypeScript types and interfaces

**Analysis Steps:**
- Validate requirements against Next.js 15 capabilities
- Identify affected routes, components, and layouts
- Determine server vs client component requirements
- Assess data fetching strategy (SSR, SSG, CSR)
- Review TypeScript type requirements

### 2. Create Implementation Plan

**Plan Structure:**
1. **Objective Summary** - Clear statement of what needs to be achieved
2. **Scope Definition** - What's included and explicitly excluded
3. **Technical Approach** - Next.js-specific implementation strategy
4. **Implementation Steps** - Detailed, ordered tasks
5. **Testing Strategy** - Component, integration, and E2E testing approach
6. **Performance Considerations** - Core Web Vitals impact

### 3. Generate Plan Document

**Output Directory:** `Documentation/`
**Output File:** `PLAN_{FEATURE_NAME}_{DATE}.md`

Create plan document with:

```markdown
# Implementation Plan: {Feature Name}

## Objective
{Clear, concise statement of the goal}

## Scope
### Included
- {Specific deliverable 1}
- {Specific deliverable 2}

### Excluded  
- {Out of scope item 1}
- {Out of scope item 2}

## Technical Approach
{Next.js-specific strategy for achieving the objective}

## Implementation Steps

### Phase 1: {Phase Name}
1. **{Task Name}** - {Task Description}
   - Location: {app/*, components/*, lib/* paths}
   - Component Type: {Server/Client Component}
   - Dependencies: {What needs to be in place}
   - Validation: {How to verify completion}

2. **{Task Name}** - {Task Description}
   - Location: {File/Component paths}
   - Component Type: {Server/Client Component}
   - Dependencies: {What needs to be in place}
   - Validation: {How to verify completion}

### Phase 2: {Phase Name}
{Continue with structured tasks...}

## Testing Requirements

### Component Tests
- {Component}: {What to test}
- {Component}: {What to test}

### Integration Tests
- {Route/Feature}: {Test scenario}
- {API Route}: {Test scenario}

### E2E Tests
- {User flow to verify}
- {Critical path to test}

## Performance Considerations

### Bundle Size Impact
- Estimated size increase: {KB}
- Code splitting strategy: {Approach}

### Core Web Vitals
- LCP Impact: {Expected impact}
- FID/INP Impact: {Expected impact}
- CLS Impact: {Expected impact}

## Risk Assessment

### Technical Risks
- **{Risk}**: {Mitigation strategy}
- **{Risk}**: {Mitigation strategy}

### Implementation Risks  
- **{Risk}**: {Mitigation strategy}
- **{Risk}**: {Mitigation strategy}

## Success Criteria
- [ ] All implementation steps completed
- [ ] TypeScript compilation passes (npx tsc --noEmit)
- [ ] ESLint passes (npm run lint)
- [ ] Build succeeds (npm run build)
- [ ] Tests passing
- [ ] No regression in Core Web Vitals
- [ ] {Feature-specific success metric}

## Estimated Complexity
- **Components**: {Low/Medium/High}
- **API Routes**: {Low/Medium/High}
- **State Management**: {Low/Medium/High}
- **Testing**: {Low/Medium/High}
- **Overall**: {Low/Medium/High}
```

## Planning Guidelines

### Good Implementation Steps for Next.js:
✅ "Create new RSC component for ProductList in app/products/components/ProductList.tsx"
✅ "Add dynamic route handler in app/api/products/[id]/route.ts"
✅ "Implement client-side form validation using React Hook Form in ContactForm component"
✅ "Add Tailwind CSS animations for loading states using animate-pulse"

### Poor Implementation Steps:
❌ "Update the frontend"
❌ "Add necessary changes"
❌ "Implement the feature"

### Next.js-Specific Considerations:

#### Server vs Client Components:
- Default to Server Components for better performance
- Use Client Components only when needed (interactivity, browser APIs, hooks)
- Mark with 'use client' directive when required

#### Data Fetching Patterns:
- Server Components: Direct async/await in components
- Client Components: Use SWR or TanStack Query
- API Routes: For external API integration or mutations

#### Routing Patterns:
- File-based routing in /app directory
- Dynamic routes with [param] syntax
- Route groups with (folder) syntax
- Parallel routes with @folder syntax
- Intercepting routes with (.)folder syntax

## Common Next.js Implementation Patterns

### Feature Addition Pattern:
1. Route structure planning (pages, layouts, loading, error)
2. Server Component implementation
3. Client Component implementation (if needed)
4. API route creation (if needed)
5. Data fetching strategy implementation
6. Tailwind CSS styling
7. TypeScript types/interfaces
8. Loading and error states
9. Test coverage
10. Performance optimization

### Page Creation Pattern:
1. Create route folder in /app
2. Implement page.tsx (Server Component by default)
3. Add loading.tsx for loading state
4. Add error.tsx for error boundary
5. Implement layout.tsx if needed
6. Add metadata for SEO
7. Implement data fetching
8. Add client interactivity if needed

### Component Creation Pattern:
1. Determine Server vs Client Component
2. Create component file with TypeScript
3. Define props interface
4. Implement component logic
5. Add Tailwind CSS classes
6. Handle loading/error states
7. Add accessibility attributes
8. Write component tests

### API Route Pattern:
1. Create route.ts in app/api structure
2. Implement HTTP method handlers (GET, POST, etc.)
3. Add request validation
4. Implement business logic
5. Add error handling
6. Return NextResponse
7. Add TypeScript types
8. Test with different scenarios

## Integration with Development Workflow

The plan serves as the execution blueprint:
- Each step becomes a development task
- Dependencies guide implementation order
- Validation criteria ensure quality
- Testing requirements maintain stability

## Success Metrics

- **Completeness**: All requirements addressed
- **Performance**: Meets Core Web Vitals targets
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: Passes linting and formatting
- **Testability**: Comprehensive test coverage
- **Maintainability**: Follows Next.js best practices
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO**: Proper metadata and structure