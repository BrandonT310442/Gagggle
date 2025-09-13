---
allowed-tools: [Read, Write, Grep, Glob, Task, Search]
---

# Plan - Implementation Planning from Issue Requirements

Creates a detailed implementation plan based on issue requirements and understanding context from the codebase.

# Usage

- `/plan` - Creates implementation plan using understanding and requirements documents
- Typically called after `/understand` and `/define-requirements` commands

# Process

## 1. Gather Context

**Required Input Documents (from `Documentation/analysis/{YYYY-MM-DD}/`):**
- `UNDERSTANDING_{FEATURE_NAME}.md` - Feature analysis from `/understand`
- `REQUIREMENTS_{ISSUE_NAME}.md` - Requirements from `/define-requirements`
- Target release branch (from Linear tags or user input)

**Read and Analyze:**
- Load understanding document from today's Documentation/analysis directory
- Load requirements document from same directory
- Extract constraints, patterns, and dependencies
- Map requirements to specific implementation tasks

**Analysis Steps:**
- Validate requirements against technical feasibility
- Identify affected components from understanding document
- Determine implementation sequence and dependencies
- Assess technical complexity and risks

## 2. Create Implementation Plan

**Plan Structure:**
1. **Objective Summary** - Clear statement of what needs to be achieved
2. **Scope Definition** - What's included and explicitly excluded
3. **Technical Approach** - High-level strategy for implementation
4. **Implementation Steps** - Detailed, ordered tasks
5. **Testing Strategy** - What needs to be tested and how
6. **Risk Assessment** - Potential issues and mitigation strategies

## 3. Generate Plan Document

**Output Directory:** `Documentation/analysis/{YYYY-MM-DD}/`
**Output File:** `PLAN_{FEATURE}_{ISSUE_NAME}.md`

Create plan document with:

```markdown
# Implementation Plan: {Feature} - {Issue Name}

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
{High-level strategy for achieving the objective}

## Implementation Steps

### Phase 1: {Phase Name}
1. **{Task Name}** - {Task Description}
   - Location: {File/Component paths}
   - Dependencies: {What needs to be in place}
   - Validation: {How to verify completion}

2. **{Task Name}** - {Task Description}
   - Location: {File/Component paths}
   - Dependencies: {What needs to be in place}
   - Validation: {How to verify completion}

### Phase 2: {Phase Name}
{Continue with structured tasks...}

## Testing Requirements

### Unit Tests
- {Component/Function}: {What to test}
- {Component/Function}: {What to test}

### Integration Tests
- {Flow/Feature}: {Test scenario}
- {Flow/Feature}: {Test scenario}

### Manual Validation
- {User scenario to verify}
- {Edge case to check}

## Risk Assessment

### Technical Risks
- **{Risk}**: {Mitigation strategy}
- **{Risk}**: {Mitigation strategy}

### Implementation Risks  
- **{Risk}**: {Mitigation strategy}
- **{Risk}**: {Mitigation strategy}

## Success Criteria
- [ ] All implementation steps completed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No regression in existing functionality
- [ ] {Feature-specific success metric}

## Estimated Complexity
- **Backend**: {Low/Medium/High}
- **Frontend**: {Low/Medium/High}
- **Testing**: {Low/Medium/High}
- **Overall**: {Low/Medium/High}
```

## 4. Plan Quality Checks

Ensure the plan:
- **Is Actionable** - Each step can be executed independently
- **Is Measurable** - Clear completion criteria for each task
- **Follows Patterns** - Aligns with existing codebase patterns
- **Is Testable** - Defines how to verify success
- **Manages Risk** - Identifies and mitigates potential issues

## Planning Guidelines

### Good Implementation Steps:
✅ "Add audit_mode boolean field to AssistantSettings model in assistant/domain/models.py"
✅ "Create AuditModeToggle component using Switch from UI library"
✅ "Update assistant API to handle audit_mode in settings endpoint"

### Poor Implementation Steps:
❌ "Implement audit mode functionality"
❌ "Update the frontend"
❌ "Add necessary backend changes"

### Risk Assessment Examples:
- **State Management Complexity**: Use existing Zustand store pattern
- **API Breaking Changes**: Add field as optional with default value
- **UI Consistency**: Follow UI library patterns for toggle components

## Integration with /implement

The plan serves as the execution blueprint for `/implement`:
- Each step becomes a todo item
- Dependencies guide execution order
- Validation criteria ensure quality
- Risk mitigation prevents common issues

## Common Planning Patterns

### Feature Addition Pattern:
1. Domain model updates
2. API endpoint modifications  
3. Frontend API client updates
4. UI component implementation
5. State management integration
6. Test coverage
7. Documentation updates

### Bug Fix Pattern:
1. Root cause identification
2. Minimal fix implementation
3. Regression test addition
4. Related issue check
5. Documentation if needed

### Refactoring Pattern:
1. Current state analysis
2. Incremental changes
3. Test preservation/updates
4. Performance validation
5. Documentation updates

## Success Metrics

- **Completeness**: All requirements addressed
- **Clarity**: Unambiguous implementation steps
- **Feasibility**: Realistic given codebase constraints
- **Testability**: Clear validation approach
- **Maintainability**: Follows established patterns