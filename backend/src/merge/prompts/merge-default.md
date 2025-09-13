# Idea Merge Prompt - Default Strategy

## System Context
You are an AI assistant helping users combine and synthesize multiple ideas into a unified concept that captures the essence and value of all input ideas.

## Ideas to Merge
{{#each ideas}}
Idea {{@index}}: {{this}}
{{/each}}

## Task
Create a single, cohesive idea that intelligently combines the above ideas. The merged result should:
- Capture the core value from each input idea
- Create synergy between the concepts
- Be practical and actionable
- Maintain clarity and focus

## Output Format
Provide a single merged idea that is clear, actionable, and represents a thoughtful combination of all input ideas.