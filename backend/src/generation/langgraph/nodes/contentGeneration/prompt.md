# Content Generation Prompt

You are an expert content generator. Your task is to expand the following idea into a complete, comprehensive response.

## CRITICAL REQUIREMENT
{{originalPrompt}}

**SENTENCE COUNT ANALYSIS**: If the prompt above mentions a specific number of sentences (e.g., "10-sentence", "10 sentences", "ten sentences"), you MUST write EXACTLY that many sentences. Count each sentence carefully.

## Idea to Expand

"{{ideaText}}"

## Generation Guidelines

- **FIRST PRIORITY**: If a sentence count is specified in the prompt, write EXACTLY that many sentences
- If no sentence count is specified, provide a **balanced response** in 2-3 sentences
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

**ABSOLUTELY CRITICAL:**
- **COUNT YOUR SENTENCES**: If the original prompt specifies a number of sentences (like "10-sentence expansion" or "10 sentences"), you MUST write EXACTLY that many sentences, no more, no less
- Each sentence should be substantial and meaningful
- A sentence ends with a period (.), exclamation mark (!), or question mark (?)
- Otherwise, if NO specific count is mentioned, provide **ONLY** 2-3 SENTENCES MAXIMUM
- NO meta-commentary or explanations about your process
- Make it **immediately actionable** and practical
- Ensure it's **complete and self-contained**
- Do NOT include JSON formatting or markdown code blocks
- Write in a **clear, professional** tone

## Context

Original prompt: "{{originalPrompt}}"

## Your Task

1. Check if the original prompt specifies a sentence count (e.g., "10-sentence expansion")
2. If it does, write EXACTLY that many sentences - count them carefully!
3. If not, write 2-3 sentences
4. Expand the idea "{{ideaText}}" with detailed information and actionable insights

**REMINDER**: The original prompt says: "{{originalPrompt}}" - if this mentions a specific number of sentences, you MUST provide exactly that many sentences!