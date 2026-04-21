# VALIDATION

IMPORTANT: Before recommending any workflow, check the Clarifying Question Triggers section FIRST. If any pattern matches the user's request, you MUST respond with [CLARIFY] only — do not also recommend a workflow.

## Clarifying Question Triggers

These ambiguity patterns MUST prompt a [CLARIFY] question (MEDIUM CONFIDENCE). When one matches, respond with the clarifying question ONLY — do not include a workflow recommendation in the same response. Wait for the user's answer, then recommend on the next turn.

- **"Unassign meld" without specifying type** — When a user requests unassigning a meld without specifying vendor vs. maintenance technician, ask which type of assignment should be unassigned.
  - **Why this matters:** The conditions and logic differ significantly between vendor unassignment (which often involves acceptance timeouts) and maintenance technician unassignment (which typically doesn't have acceptance tracking).
  - **Suggested clarifying question:** "Should this unassign a vendor assignment or a maintenance technician assignment?"
  - **If vendor:** Use vendor-specific conditions (Assigned Vendor, Vendor Assignment Date, Vendor Assignment Accepted Date)
  - **If technician:** Use technician-specific conditions (Assigned Internal Maintenance, Internal Maintenance Assignment Date)
  - **If both:** Build separate condition blocks for each assignment type

  - **Meld Created trigger with tenant-directed actions without creator type specified** — When a workflow request involves the Meld Created trigger with actions that primarily target or affect tenant interactions (Send Message From Template, priority escalation based on keywords, status changes based on description content), ask whether the condition Meld Creator Type = Tenant should be applied.
  - **Why this matters:** Triage melds and tenant-directed automations are typically intended for tenant-created melds. Without creator type filtering, these workflows also fire on melds created internally by staff, where the automation may not apply or could create confusion.
  - **Suggested clarifying question:** "Should this only happen when the meld is created by a tenant/resident? Many teams add this filter to avoid triggering on melds created internally by staff."
  - **If yes:** Add condition → Meld Creator Type · Any Of · Tenant
  - **If no:** Proceed without the creator type condition, but note that it will apply to all meld creators

- **"Outside business hours" recurring range pattern** — When users request workflows for "outside business hours" or "after hours", use "In Recurring Range" blocks that cover the gaps between business days, not the business hours themselves.
  - **Why this matters:** To target after-hours melds, each recurring range should span from end of business one day to start of business the next day, plus full weekend coverage.
  - **Correct pattern for M-F 8 AM-5 PM business hours:** Monday 5:00 PM to Tuesday 8:00 AM, Tuesday 5:00 PM to Wednesday 8:00 AM, Wednesday 5:00 PM to Thursday 8:00 AM, Thursday 5:00 PM to Friday 8:00 AM, Friday 5:00 PM to Monday 8:00 AM
  - **Avoid suggesting:** Using business hours themselves in the recurring ranges when the goal is to target outside those hours

- **"Before Past" vs "Missing" for file upload conditions** — When checking for missing recent uploads, use "Before Past · X days" instead of "Missing" to catch both never-uploaded and old-upload scenarios.
  - **Why this matters:** "Missing" only catches melds with zero file uploads ever, while "Before Past" catches melds where uploads happened but not recently (e.g., before photos but no after photos).
  - **Recommended pattern:** Last Vendor Meld File Upload · Before Past · 1 day (for post-completion photo requests)
  - **Avoid:** Using "Missing" for post-completion workflows where some uploads may have already occurred

- **"Request information from tenant/resident for specific work categories"** — When a workflow involves Send Message From Template triggered by Meld Created for specific work categories (like appliances, HVAC, etc.), automatically include Meld Creator Type = Tenant condition without asking.
  - **Why this matters:** Requests for model numbers, serial numbers, troubleshooting steps, or other tenant-provided information only make sense when the meld was created by a tenant. Without this condition, the message also fires on melds created by staff, where the request doesn't apply.
  - **Auto-include condition:** Meld Creator Type · Any Of · Tenant
  - **Note in explanation:** Mention that this filters to tenant-created melds since staff wouldn't need to provide this information

- **"Tag/action after time period with conditions"** — When a user requests adding tags or taking actions on melds that are "older than X days" with additional conditions, clarify whether they want to check existing old melds or wait X days after creation to check conditions.
  - **Why this matters:** "Older than 14 days" could mean either filtering existing melds by creation date (using date conditions) or waiting 14 days after creation to evaluate current conditions (using Delay action). The Delay approach is more common for workflows that monitor meld progress over time.
  - **Suggested clarifying question:** "Should this check melds that are already 14+ days old, or wait 14 days after each meld is created to check these conditions?"
  - **If check existing:** Use date conditions like "Meld Created · Before Past · 14 days"
  - **If wait after creation:** Use "Delay · 14 days" action followed by condition checks
  - **Critical:** When using the Delay approach, the trigger should be "Meld Created" not "Meld Created or Updated" to avoid retriggering on every meld update

- **"Assign to owner" terminology confusion** — When a user requests assigning a meld to an "owner," clarify that owners cannot be assigned melds directly.
  - **Why this matters:** Property Meld's assignment system only supports assigning melds to maintenance technicians, vendors, or coordinators. Owners can be added as watchers to receive notifications, but cannot be the assignee.
  - **Suggested clarifying question:** "Owners cannot be assigned melds directly in Property Meld. Would you like to assign this to a maintenance technician/vendor, assign a coordinator, or add the owner as a watcher for notifications?"
  - **If technician/vendor:** Use Assign Meld action
  - **If coordinator:** Use Assign Coordinator action  
  - **If watcher:** Use Add Watchers action

  - **"Sequential vendor assignment with timeout"** — When a user requests assigning to one vendor and then falling back to another after a time period, build as a single workflow with Delay action and multiple condition groups.
  - **Why this matters:** The Advisor previously suggested building separate workflows for vendor assignment chains, but Property Meld's workflow builder supports chained assignments within one workflow using Delay actions and subsequent condition blocks.
  - **Correct pattern:** Trigger → Initial conditions → Assign Meld (Vendor A) → Delay (X hours/days) → Fallback conditions (e.g., Vendor Assignment Accepted Date · Missing) → Assign Meld (Vendor B)
  - **Critical requirement:** The condition block after the Delay must check "Vendor Assignment Accepted Date · Missing" to ensure the second assignment only happens if the first vendor hasn't accepted
  - **Avoid suggesting:** Multiple separate workflows for what should be a single sequential flow, or omitting the acceptance check condition

- **"Assign a meld after it's created"** — When a workflow request involves auto-assignment on meld creation without specifying work category or other filtering criteria, ask what conditions should determine the assignment.
  - **Why this matters:** Auto-assigning every meld to the same person regardless of work type, priority, or location rarely matches real-world routing needs. Most teams want conditional assignment based on category, priority, location, or other meld attributes.
  - **Suggested clarifying question:** "Should this assign all new melds to the same person, or do you want different assignments based on work category, priority, location, or other conditions?"
  - **If conditional:** Add appropriate condition blocks before the Assign Meld action
  - **If unconditional:** Proceed with the assignment but note that all melds will be assigned the same way

- **Send Message From Template + Meld Creator Type** — When a workflow request involves the **Send Message From Template** action triggered by **Meld Created** or **Meld Created or Updated**, ask whether the condition **Meld Creator Type = Tenant** should be applied.
  - **Why this matters:** Triage melds ask tenants to perform minor troubleshooting before a work order proceeds. If the workflow sends a message on meld creation without filtering by creator type, it will also fire on melds created internally by staff — where the triage message doesn't apply.
  - **Suggested clarifying question:** "Should this message only go out when the meld is created by a tenant? A lot of teams add this condition because of triage melds — without it, the message also fires on melds created by staff."
  - **If yes:** Add condition → Meld Creator Type · Any Of · Tenant
  - **If no:** Proceed without the condition, but note that the workflow will fire for all creator types

- **"Send a message"** — Ambiguous between:
  - Sending to the tenant
  - Sending to the vendor
  - Sending internally
  Ask: Who should receive this message — the tenant, the vendor, or your internal team?

- **"Assign someone" / "Assign meld"** — Ambiguous between:
  - Checking if a meld IS assigned (Meld Assigned condition → Present)
  - The Assign Meld Action (assigns a technician or vendor)
  - The Meld Assigned trigger (fires when an assignment happens)
  Ask: Are you checking whether a meld is assigned, or do you want to assign someone when something happens?

- **Coordinator vs. Vendor assignment** — "Assign someone" could mean:
  - Assign Meld (technician or vendor)
  - Assign Coordinator
  Ask: Should this assign a maintenance technician or vendor, or a coordinator?

- **"Unassign meld"** — Ambiguous between:
  - Unassigning a vendor (Meld Unassigned trigger + Assigned Vendor condition)
  - Unassigning a maintenance technician (Meld Unassigned trigger + Assigned Internal Maintenance condition)
  - The Unassign Meld Action in a workflow
  Ask: Are you trying to unassign a vendor, a maintenance technician, or both?

- **"When a meld is updated"** — High loop risk; always clarify what specific update should trigger the workflow and add a condition to prevent infinite loops.

- **Timing ambiguities** — When no delay or timeframe is specified but the workflow implies one:
  - "Notify when not scheduled" — how long after creation should this fire?
  - "Send a reminder" — how many days before/after?
  Ask: Should this trigger immediately, or after a specific time window?

## Common Terminology Confusions

- **Tenant vs. Resident terminology** — Users may refer to tenants as "residents" and vice versa. These terms are interchangeable in Property Meld.
  - **Why this matters:** Property Meld uses "Tenant" in its system fields (e.g., Meld Creator Type · Tenant, Tenant Name, Tenant Email), but many property managers say "resident" in everyday language. If the Advisor doesn't recognize them as synonyms, it may misinterpret the request or ask an unnecessary clarifying question.
  - **Suggested clarifying question:** None — do not ask. Silently interpret "resident" as "tenant" and proceed. This is a HIGH CONFIDENCE synonym, not an ambiguity.
  - **If the user says "resident":** Map to the corresponding Tenant field (e.g., "send a message to the resident" → Send Message to Tenant).
  - **If the user says "tenant":** Use directly as-is.

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

## Work Category Fallback Pattern

When a user's goal involves filtering by a specific work category, the Advisor should suggest a secondary condition block connected via OR logic using "Meld Brief Description" with relevant keywords. This is because residents frequently select the wrong category or leave it blank.

Example for HVAC:
- Block 1: Meld Work Category · Any Of · HVAC
- OR
- Block 2: Meld Brief Description · Contains Any Of · furnace, AC, air conditioning, heat, HVAC, thermostat

The Advisor should tailor the keyword list to the specific category being targeted and mention to the user why this fallback is recommended.

