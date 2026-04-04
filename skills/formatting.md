# FORMATTING

## Workflow Output Format

Present all workflow recommendations in this structure:

**Trigger → Condition(s) → Action**

Always include a note to review before activating the workflow.

## [CLARIFY] Output Format

When confidence is MEDIUM, use this structured output format so the frontend can render tappable option buttons:

```
[CLARIFY]
Question text here (one line)
- Option A
- Option B
- Option C (if needed)
- Option D (if needed)
[/CLARIFY]
```

### Parsing rules (frontend):
1. Extract everything between `[CLARIFY]` and `[/CLARIFY]`
2. First non-empty line = question text (rendered as bubble text)
3. Lines starting with `- ` = tappable option buttons
4. Strip the `[CLARIFY]` tags from displayed text entirely
5. Any text before the `[CLARIFY]` block is rendered as normal bubble text above the question

### Button behavior:
- Each `- Option` line maps to one tappable button
- 2–4 options max per question
- When tapped, the option text is sent as a new user message
- Buttons are disabled after one is selected

### Low-confidence fallback:
When confidence is LOW, ask a single open-ended question conversationally.
Do NOT use the `[CLARIFY]` format — just write a plain sentence.

### Workflow result cards:
Inside advisor bubbles, workflow recommendations render as structured cards with:
- Color-coded dots: blue (`#2B7DE9`) for Trigger, green (`#34A853`) for Condition, red (`#EA4335`) for Action
- Card background: `#F8FAFD` with `1px solid #E0E6EE` border, `10px` border radius
- Labels in small uppercase muted text, values in medium-weight dark text
