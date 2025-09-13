# Implementation Plan: PromptingBox Component

## Objective
Create a modern, interactive prompting box component for the frontend that allows users to select an LLM provider, specify idea count, input prompts, and submit requests. The component will match the Figma design specifications and integrate seamlessly with the existing Next.js application.

## Scope
### Included
- PromptingBox React component with TypeScript interfaces
- Dropdown components for LLM provider selection (Cohere)
- Dropdown for idea count selection (3 ideas)
- Textarea for prompt input with placeholder text
- Submit button with arrow icon
- Responsive design using Tailwind CSS
- Integration with main application layout

### Excluded
- Backend API integration (will be handled separately)
- Form validation logic (basic validation only)
- Advanced dropdown animations
- Multiple LLM provider implementations

## Technical Approach
The component will be built as a client-side React component using Next.js 15 patterns:
- TypeScript interfaces for type safety
- Tailwind CSS for styling to match Figma design
- React hooks for state management
- Modular design with reusable dropdown components
- Accessible markup with proper ARIA attributes

## Implementation Steps

### Phase 1: Component Structure
1. **Create PromptingBox Component** - Main container component
   - Location: `app/components/PromptingBox.tsx`
   - Component Type: Client Component
   - Dependencies: React hooks, TypeScript interfaces
   - Validation: Component renders with empty state

2. **Define TypeScript Interfaces** - Type definitions for props and state
   - Location: `app/components/PromptingBox.tsx`
   - Component Type: Type definitions
   - Dependencies: None
   - Validation: TypeScript compilation passes

### Phase 2: Dropdown Components
1. **Create Dropdown Component** - Reusable dropdown base component
   - Location: `app/components/Dropdown.tsx`
   - Component Type: Client Component
   - Dependencies: React hooks for state
   - Validation: Dropdown opens/closes on click

2. **Implement LLM Provider Dropdown** - Specific dropdown for LLM selection
   - Location: `app/components/PromptingBox.tsx`
   - Component Type: Client Component
   - Dependencies: Dropdown component, Cohere icon
   - Validation: Shows "Cohere" with icon, expandable

3. **Implement Ideas Count Dropdown** - Dropdown for idea quantity
   - Location: `app/components/PromptingBox.tsx`
   - Component Type: Client Component
   - Dependencies: Dropdown component
   - Validation: Shows "3 ideas" with expand icon

### Phase 3: Input and Submit
1. **Create Prompt Textarea** - Input area for user prompts
   - Location: `app/components/PromptingBox.tsx`
   - Component Type: Client Component
   - Dependencies: React state hooks
   - Validation: Accepts text input, shows placeholder

2. **Implement Submit Button** - Action button with arrow icon
   - Location: `app/components/PromptingBox.tsx`
   - Component Type: Client Component
   - Dependencies: Arrow icon component
   - Validation: Button triggers onClick handler

### Phase 4: Integration
1. **Replace Page Content** - Integrate component into main page
   - Location: `app/page.tsx`
   - Component Type: Update existing page
   - Dependencies: PromptingBox component
   - Validation: Component displays on homepage

2. **Style Refinements** - Match exact Figma specifications
   - Location: `app/components/PromptingBox.tsx`
   - Component Type: Client Component
   - Dependencies: Tailwind CSS utilities
   - Validation: Visual match with Figma design

## Testing Requirements

### Component Tests
- PromptingBox: Renders all child components correctly
- Dropdown: Opens/closes state management
- Submit Button: Click event handling

### Integration Tests
- Page: PromptingBox renders on main route
- Form State: Input values are captured correctly

### E2E Tests
- User can select LLM provider from dropdown
- User can select idea count from dropdown
- User can type in prompt textarea
- User can submit form with valid input

## Performance Considerations

### Bundle Size Impact
- Estimated size increase: ~15KB
- Code splitting strategy: Component-level lazy loading if needed

### Core Web Vitals
- LCP Impact: Minimal, component is above the fold
- FID/INP Impact: Good, simple interactions
- CLS Impact: None expected, fixed layout

## Risk Assessment

### Technical Risks
- **Icon Assets**: Ensure SVG icons are properly imported - Use React SVG components or optimize asset loading
- **Dropdown State**: Complex dropdown interactions - Keep state management simple with useState

### Implementation Risks
- **Design Matching**: Exact pixel matching with Figma - Use Figma's provided CSS values and spacing
- **Responsive Behavior**: Component layout on mobile - Test responsive breakpoints

## Success Criteria
- [ ] All implementation steps completed
- [ ] TypeScript compilation passes (npx tsc --noEmit)
- [ ] ESLint passes (npm run lint)
- [ ] Build succeeds (npm run build)
- [ ] Component matches Figma design visually
- [ ] All interactive elements functional
- [ ] Responsive design works on mobile/desktop
- [ ] No accessibility warnings in browser

## Estimated Complexity
- **Components**: Medium (multiple interactive components)
- **API Routes**: Low (no backend changes)
- **State Management**: Low (simple form state)
- **Testing**: Low (straightforward component testing)
- **Overall**: Medium
