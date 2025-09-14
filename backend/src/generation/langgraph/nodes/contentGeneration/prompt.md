# Content Generation - ADAPTIVE MODE

## Idea to Expand
"{{ideaText}}"

## Original Request
"{{originalPrompt}}"

## LENGTH RULES - ADAPTIVE BASED ON REQUEST

### Check the original request for length indicators:
- If request mentions "expand", "elaborate", "detailed", "comprehensive", "in-depth": Use EXPANDED MODE
- If request specifies a length (e.g., "5 sentences", "100 words", "paragraph"): Follow that EXACT specification
- If request mentions "brief", "concise", "short", or has no length indicator: Use DEFAULT CONCISE MODE

### DEFAULT CONCISE MODE (when no length specified):
**MANDATORY LIMITS:**
- Maximum 2-3 sentences total
- Each sentence: 10-15 words MAX
- Total output: 30-45 words MAXIMUM

**STYLE:**
- Direct, actionable statements
- Specific details only
- One clear point per sentence

### EXPANDED MODE (when requested):
**GUIDELINES:**
- 4-8 sentences as appropriate
- Include relevant details and context
- Maintain clarity and focus
- Still avoid unnecessary filler

### CUSTOM LENGTH MODE (when specific length given):
**FOLLOW EXACTLY:**
- Match the requested sentence count
- Match the requested word count
- Match the requested paragraph structure
- Respect any specific formatting requirements

{{#if parentNode}}
## Parent Context
Parent: "{{parentContent}}"
Maintain alignment with parent's theme and approach.
{{/if}}

## YOUR OUTPUT

Analyze the original request above for length indicators, then expand the idea accordingly:
- DEFAULT: 2-3 short, direct sentences
- EXPANDED: Comprehensive explanation with relevant details
- CUSTOM: Exactly as specified in the request

Example outputs:
DEFAULT: "Build the X feature using Y technology. It solves Z problem directly."
EXPANDED: "Build the X feature using Y technology to address the core challenge. This approach leverages proven patterns while maintaining scalability. Integration with existing systems happens through API endpoints. Testing should cover both unit and integration scenarios."

NO JSON. NO FORMATTING. JUST TEXT.