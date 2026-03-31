# Meld Workflow Advisor

An AI-powered tool that helps Property Meld users build 
automations in plain English.

# Meld Workflow Advisor — Skills Architecture

## Purpose
This skills folder contains the modular knowledge base for the Meld Workflow 
Advisor. Each skill file isolates a specific domain so Claude Code can load 
only what's relevant at any given moment, keeping context focused and output 
quality high.

## Skill Files
❖ triggers.md — All 11 workflow triggers with definitions
❖ conditions.md — All 63 conditions with operators and sub-operators (IN PROGRESS)
❖ actions.md — All actions and sub-actions with definitions (PENDING)
❖ validation.md — Valid/invalid trigger+condition+action combinations (PENDING)
❖ formatting.md — Output structure, tone, and ambiguity handling (PENDING)

## File Format Convention
❖ Top level — Condition / Trigger / Action name
➤ Second level — Operator
▪ Third level — Sub-operator (required input field)

## Philosophy
- Explicit over implied — repeat definitions rather than reference them
- Let complexity dictate length — no artificial word limits
- Ship and iterate — start lean, add depth (compatibility notes, firing 
  behavior, edge cases) in future sessions

## Status
- triggers.md — ✅ Complete
- conditions.md — 🔄 In Progress
- actions.md — ⏳ Pending
- validation.md — ⏳ Pending
- formatting.md — ⏳ Pending
