# Idea Extraction Prompt

Generate {{count}} different ideas for: "{{prompt}}"

{{#if parentNode}}
Context: These ideas should expand on "{{parentContent}}"
{{/if}}

{{#if domain}}
Domain: {{domain}}
{{/if}}

{{#if style}}
{{#if isBrief}}
Style: Keep ideas short and concise (few words each)
{{/if}}
{{#if isDetailed}}
Style: Make ideas more descriptive and specific
{{/if}}
{{#if isCreative}}
Style: Be creative and think outside the box
{{/if}}
{{/if}}

## Instructions
- Generate exactly {{count}} distinct ideas
- Each idea should be different from the others
- Keep ideas concise (a few words to one sentence)
- Return ONLY a JSON array of strings

## Example Output
```json
[
  "Gamification with badges",
  "AI-powered personalization",
  "Interactive video tutorials",
  "Progressive disclosure design",
  "Social proof integration"
]
```