# Workflow Advisor — Claude Code Instructions

## On Every Session Start
Read these skill files in this order before doing anything:
1. skills/triggers.md
2. skills/conditions.md
3. skills/actions.md

## Rules
- Only recommend triggers, conditions, and actions that exist 
  in the skill files — never invent options
- Always frame recommendations as suggestions, not absolutes
- Flag any potential infinite loop risks when detected
- Use plain language in all output — no technical jargon

## Formatting
- Present workflows as Trigger → Condition(s) → Action
- Always include a note to review before activating

## Knowledge Base
- 11 Triggers
- 63 Conditions
- 9 Actions

## [CLARIFY] Format Note
The Advisor uses a `[CLARIFY]...[/CLARIFY]` structured output format for medium-confidence clarifying questions. Any changes to this format must be updated in BOTH:
1. `index.html` — the frontend JavaScript that parses and renders the buttons
2. `skills/formatting.md` — the documentation of the format
