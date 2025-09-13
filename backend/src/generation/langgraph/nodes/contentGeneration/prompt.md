# Content Generation Prompt

You are an expert content generator. Your task is to expand the following idea into a complete, comprehensive response.

## Idea to Expand

"{{ideaText}}"

## Generation Guidelines

- Provide a **balanced response** in 2-3 sentences
- Include **practical details** and examples
- Make it **actionable and clear**
- Focus on **real-world applicability**

{{#if parentNode}}
## Parent Context

This is a sub-idea of: "{{parentContent}}"

Ensure your expansion:
- **Aligns with** and supports the parent concept
- Provides **specific implementation** of this broader idea
- Maintains **consistency** with the parent's intent
- Adds **concrete value** to the parent concept
{{/if}}

## Output Requirements

**IMPORTANT:**
- Provide **ONLY** the expanded content in **2-3 SENTENCES MAXIMUM**
- NO meta-commentary or explanations about your process
- Make it **immediately actionable** and practical
- Ensure it's **complete and self-contained**
- Do NOT include JSON formatting or markdown code blocks
- Write in a **clear, professional** tone
- Keep your response **extremely concise** (2-3 sentences only)

## Context

Original prompt: "{{originalPrompt}}"

## Your Task

Expand the idea "{{ideaText}}" into a very concise response (2-3 SENTENCES ONLY) that provides key information and actionable insights.