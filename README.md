# Meld Workflow Advisor

An AI-powered tool that helps Property Meld users build 
automations in their own words. The Advisor recommends 
a Trigger, Conditions, and Action based on the user's 
goal — always review before activating.

## What It Does
Users describe a workflow goal in plain language and the 
Advisor recommends the appropriate Property Meld components — 
trigger, conditions, and action — ready to build in the app.

## How It's Built
- Single HTML file deployed via Vercel
- Calls the Anthropic API (Claude) on the backend
- Knowledge base stored as modular markdown skill files
- Styled with Property Meld branding (#1175CC)

---

# Skills Architecture

## Purpose
This skills folder contains the modular knowledge base for 
the Meld Workflow Advisor. Each skill file isolates a specific 
domain so Claude Code can load only what's relevant at any 
given moment, keeping context focused and output quality high.

## Skill Files
- triggers.md — All 11 workflow triggers with definitions
- conditions.md — All 63 conditions with operators and sub-operators
- actions.md — All 9 actions with sub-options
- validation.md — Valid/invalid trigger+condition+action combinations (PENDING)
- formatting.md — Output structure, tone, and ambiguity handling (PENDING)

## File Format Convention
Standard markdown hierarchy:

## Condition / Trigger / Action name
- Operator
  - Sub-operator (required input field)

## Philosophy
- Explicit over implied — repeat definitions rather than reference them
- Let complexity dictate length — no artificial word limits
- Ship and iterate — start lean, add depth in future sessions
- Fixed system values spelled out explicitly
- Dynamic/customer-defined values noted as "Select: Applicable [X]"
- Long repeated option lists use [same options as Any Of] shorthand

## Known Risks & Guard Rails
- Meld Updated + any action that modifies the meld = potential 
  infinite loop risk
- Meld Chat Sent + Send Message action = highest loop risk combination
- Always use conditions as circuit breakers to limit trigger scope

## Status
- triggers.md — ✅ Complete
- conditions.md — ✅ Complete
- actions.md — ✅ Complete
- validation.md — ⏳ Pending
- formatting.md — ⏳ Pending

## Roadmap
- validation.md — document valid/invalid workflow combinations
- formatting.md — output tone, ambiguity handling, disclaimer language
- Loop detection — flag infinite loop risks before user activates workflow
- Widget integration — embed Advisor as in-app widget within Property Meld
