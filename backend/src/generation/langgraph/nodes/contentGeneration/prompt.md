# Content Generation Prompt

You are an expert content generator. Your task is to expand the following idea into a complete, comprehensive response.

## Idea to Expand

"{{ideaText}}"

## Generation Guidelines

{{#if style}}
### Style: {{style}}

{{#if isBrief}}
- Keep the response **concise and focused** (2-3 paragraphs)
- Use **bullet points** for clarity
- Focus on the **most important** aspects
- Get straight to the point
{{/if}}

{{#if isDetailed}}
- Provide a **comprehensive response** (4-5 paragraphs)
- Include **step-by-step instructions** where applicable
- Cover **multiple aspects** and considerations
- Add **examples and specifics**
- Include implementation details
{{/if}}

{{#if isCreative}}
- Think **innovatively** and propose unique solutions
- Use **creative language** and metaphors where appropriate
- Suggest **unconventional approaches**
- Make it **engaging and inspiring**
- Challenge traditional thinking
{{/if}}
{{else}}
### Default Style
- Provide a **balanced, well-structured** response
- Include **practical details** and examples
- Make it **actionable and clear**
- Focus on **real-world applicability**
{{/if}}

{{#if domain}}
## Domain Context

This should be relevant to **{{domain}}**. Consider:
- Domain-specific best practices
- Appropriate terminology
- Industry standards and conventions
- Common challenges in this domain
{{/if}}

{{#if parentNode}}
## Parent Context

This is a sub-idea of: "{{parentContent}}"

Ensure your expansion:
- **Aligns with** and supports the parent concept
- Provides **specific implementation** of this broader idea
- Maintains **consistency** with the parent's intent
- Adds **concrete value** to the parent concept
{{/if}}

{{#if maxLength}}
## Length Constraint

Keep the response under **{{maxLength}} characters**.
{{/if}}

## Output Requirements

**IMPORTANT:**
- Provide **ONLY** the expanded content
- NO meta-commentary or explanations about your process
- Make it **immediately actionable** and practical
- Ensure it's **complete and self-contained**
- Do NOT include JSON formatting or markdown code blocks
- Write in a **clear, professional** tone

## Context

Original prompt: "{{originalPrompt}}"

## Your Task

Expand the idea "{{ideaText}}" into a full, comprehensive response that provides detailed information, actionable steps, and practical insights.