# VALIDATION

## Common Terminology Confusions

- "Unassign Meld" is an ACTION not a condition — interpret as Meld Assigned → Missing
  - Example: User says "when Unassign Meld happens" → system would otherwise treat it as a condition check, silently producing wrong logic.
- "Assign Meld" is an ACTION — interpret as Meld Assigned → Present
- When user references an action as a condition, flag it and suggest the correct condition equivalent
- NOTE: Rules marked ⚠️ are logical recommendations pending verification in the live app.

## Infinite Loop Risks
- Meld Updated + Send Message = HIGH LOOP RISK ⚠️
- Meld Chat Sent + Send Message = HIGHEST LOOP RISK ⚠️
- Meld Updated + Add Tag = LOOP RISK ⚠️
- Meld Updated + Change Status = LOOP RISK ⚠️
- Always recommend a condition as a circuit breaker

## Trigger + Condition Compatibility ⚠️
- Invoice conditions should only pair with
  Invoice Submitted or Invoices Updated triggers
- Tenant Rating conditions should only pair with
  Tenant Rating Submitted trigger
- Work Entry conditions pair best with
  Meld Assigned or Meld Updated triggers

## Invalid Combinations ⚠️
- Meld Completed + Meld Status set to Pending =
  logically contradictory
- Meld Unassigned + Assigned Vendor condition =
  logically contradictory

## Clarifying Question Triggers

These ambiguity patterns should prompt a [CLARIFY] question (MEDIUM CONFIDENCE):

- **"Unassign meld"** — Ambiguous between:
  - Unassigning a vendor (Meld Unassigned trigger + Assigned Vendor condition)
  - Unassigning a maintenance technician (Meld Unassigned trigger + Assigned Internal Maintenance condition)
  - The Unassign Meld Action in a workflow
  Ask: Are you trying to unassign a vendor, a maintenance technician, or both?

- **"Assign meld"** — Ambiguous between:
  - Checking if a meld IS assigned (Meld Assigned condition → Present)
  - The Assign Meld Action (assigns a technician or vendor)
  - The Meld Assigned trigger (fires when an assignment happens)
  Ask: Are you checking whether a meld is assigned, or do you want to assign someone when something happens?

- **Timing ambiguities** — When no delay or timeframe is specified but the workflow implies one:
  - "Notify when not scheduled" — how long after creation should this fire?
  - "Send a reminder" — how many days before/after?
  Ask: Should this trigger immediately, or after a specific time window?

- **"Send a message"** — Ambiguous between:
  - Sending to the tenant
  - Sending to the vendor
  - Sending internally
  Ask: Who should receive this message — the tenant, the vendor, or your internal team?

- **"When a meld is updated"** — High loop risk; always clarify what specific update should trigger the workflow and add a condition to prevent infinite loops.

- **Coordinator vs. Vendor assignment** — "Assign someone" could mean:
  - Assign Meld (technician or vendor)
  - Assign Coordinator
  Ask: Should this assign a maintenance technician or vendor, or a coordinator?
