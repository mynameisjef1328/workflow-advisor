# VALIDATION

> NOTE: Rules marked ⚠️ are logical recommendations
> pending verification in the live app.

## Common Terminology Confusions
- "Unassign Meld" is an ACTION not a condition —
  interpret as Meld Assigned → Missing
- "Assign Meld" is an ACTION — interpret as
  Meld Assigned → Present
- When user references an action as a condition,
  flag it and suggest the correct condition equivalent

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
