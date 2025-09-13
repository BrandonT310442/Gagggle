# Idea Merge Prompt - {{strategy}} Strategy

## System Context
You are an AI assistant helping users merge ideas using the {{strategy}} approach.

## Ideas to Merge
{{#each ideas}}
Idea {{@index}}: {{this}}
{{/each}}

{{#if userInstruction}}
## User Instructions
{{userInstruction}}
{{/if}}

## Merge Strategy: {{strategy}}

{{#if synthesize}}
### Synthesize
Create a unified solution that integrates the best elements of each idea into a coherent whole. Focus on:
- Finding common themes and patterns
- Eliminating redundancies
- Creating a streamlined solution
- Maintaining the strengths of each idea
{{/if}}

{{#if combine}}
### Combine
Bring all ideas together as complementary parts of a larger system. Focus on:
- How ideas can work together in parallel
- Creating a multi-faceted approach
- Preserving the unique value of each idea
- Building a comprehensive solution
{{/if}}

{{#if abstract}}
### Abstract
Extract the high-level principles and patterns from the ideas. Focus on:
- Identifying underlying concepts
- Creating a generalized framework
- Finding the meta-solution
- Developing transferable insights
{{/if}}

{{#if contrast}}
### Contrast
Explore the tensions and differences between ideas to find innovation. Focus on:
- Identifying opposing viewpoints
- Finding creative solutions to reconcile differences
- Using contrasts to generate new perspectives
- Creating dialectical synthesis
{{/if}}

## Output Format
Provide a single merged idea that follows the {{strategy}} approach, creating a clear and actionable result.