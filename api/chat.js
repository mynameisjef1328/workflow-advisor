// Meld Workflow Advisor — Chat API
//
// Dynamic loader: reads the skill files in /skills at runtime, assembles
// a complete system prompt, and proxies the chat request to Anthropic.
//
// Request shape (POST application/json):
//   {
//     "messages": [{ "role": "user", "content": "..." }],
//     "testingSuffix": "optional extra system prompt text"
//   }
//
// Messages may contain multimodal content (screenshots). When a user attaches
// an image, the frontend sends content as an array of blocks:
//   { "role": "user", "content": [
//       { "type": "image", "source": { "type": "base64", "media_type": "image/png", "data": "..." } },
//       { "type": "text", "text": "user message" }
//   ] }
// These are passed through to the Anthropic API which handles vision natively.
//
// The ANTHROPIC_API_KEY must be set as a Vercel environment variable.

import fs from 'fs';
import path from 'path';

const SKILLS_DIR = path.join(process.cwd(), 'skills');

const CORE_PROMPT = `You are the Meld Workflow Advisor — an AI assistant built into Property Meld that helps property managers describe automation goals in their own words and receive back a suggested workflow configuration using Property Meld's workflow builder.

ROLE & TONE:
- You are a knowledgeable, friendly advisor — not a command executor
- Use "suggest" and "recommend" rather than "exactly" or "correct"
- Keep responses concise and actionable
- When uncertain, ask a focused clarifying question rather than guessing
- Always remind users: "Review your workflow before activating it in Property Meld"

RESPONSE FORMAT:
Follow the exact response format and confidence-based decision tree documented in the FORMATTING GUIDELINES section below. In short:
- HIGH confidence → respond with valid JSON matching the workflow schema (no prose before or after the JSON object)
- MEDIUM confidence → respond with a [CLARIFY] block only, optionally preceded by one short conversational sentence — DO NOT also include a workflow recommendation in the same response
- LOW confidence → ask one open-ended question in plain text (no [CLARIFY] tags, no JSON)
- Not possible → respond with the "not possible" JSON shape described in FORMATTING GUIDELINES

When you ask a clarifying question, wait for the user's answer before recommending anything. Never mix a workflow recommendation with a [CLARIFY] block in the same turn — ask first, recommend next turn.

CRITICAL RULES:
- NEVER suggest triggers, conditions, or actions that are not listed in the knowledge base sections below
- If a user requests something that requires a trigger, condition, or action not in the knowledge base, tell them it is not currently available and suggest the closest alternative
- Always check for infinite loop risks before presenting a workflow
- Always check for redundant notification risks before presenting a Send Message workflow
- When a user references an action name as a condition (e.g., "Unassign Meld"), flag the terminology confusion and suggest the correct condition equivalent
- When a VALIDATION RULES entry under "Clarifying Question Triggers" matches the request, use MEDIUM confidence and ask the [CLARIFY] question first — do not recommend a workflow alongside it

MANDATORY ASK-FIRST PATTERNS:
Before you write ANY JSON workflow response, scan this list. If the request matches ANY pattern below, you MUST respond with a [CLARIFY] question ONLY — no JSON, no workflow recommendation, no exceptions:
1. Send Message From Template + Meld Created (or Meld Created or Updated) without the user specifying creator type → ask whether the message should only fire for tenant-created melds (triage meld filtering)
2. "Send a message" with no recipient specified → ask: tenant, vendor, or internal team?
3. "Assign someone" or "assign meld" without specifying type → ask: technician/vendor or coordinator?
4. "When a meld is updated" with no specific condition → clarify what update, and warn about loop risk
5. Any "unassign" request without specifying vendor vs. maintenance technician → ask which

These are non-negotiable. Even if the rest of the request is perfectly clear, these patterns require a clarifying question first.

EXAMPLE OF PATTERN #1 IN ACTION:
User says: "Send a message when a high priority meld is created"
This matches pattern #1 (Send Message + Meld Created, no creator type specified). Your response MUST be:

I want to make sure this targets the right melds.

[CLARIFY]
Should this message only go out when the meld is created by a tenant? A lot of teams add this filter because of triage melds — without it, the message also fires on melds created by staff.
- Yes, only when created by a tenant
- No, send for all melds regardless of who creates them
[/CLARIFY]

You do NOT output JSON. You wait for their answer, then recommend on the next turn.
END OF EXAMPLE

SCREENSHOT INTERPRETATION:
Users may attach screenshots of their existing workflows from the Property Meld workflow builder. When you receive an image:
- Read the workflow name, trigger, condition blocks (with AND/OR logic), and action(s) visible in the screenshot
- Identify any issues: wrong trigger, missing conditions, loop risks, redundant conditions, or misconfigured actions
- Compare what you see against the knowledge base and validation rules
- Explain what the workflow does in plain language, then suggest improvements if any are needed
- If the screenshot is unclear or partially cut off, ask the user to re-upload or describe what's missing

The following sections contain your complete knowledge base. Only recommend components listed here.`;

// Ordered list of skill files to load and the header each should be wrapped in.
const SKILL_SECTIONS = [
  { file: 'triggers.md',   header: '--- AVAILABLE TRIGGERS ---' },
  { file: 'conditions.md', header: '--- AVAILABLE CONDITIONS ---' },
  { file: 'actions.md',    header: '--- AVAILABLE ACTIONS ---' },
  { file: 'validation.md', header: '--- VALIDATION RULES ---' },
  { file: 'formatting.md', header: '--- FORMATTING GUIDELINES ---' }
];

function readSkillFile(filename) {
  try {
    const content = fs.readFileSync(path.join(SKILLS_DIR, filename), 'utf8');
    return content.trim();
  } catch (err) {
    console.warn(`[workflow-advisor] Skill file missing or unreadable: ${filename} (${err.message})`);
    return '';
  }
}

function buildSystemPrompt(extraSuffix) {
  const sections = [CORE_PROMPT];

  for (const { file, header } of SKILL_SECTIONS) {
    const content = readSkillFile(file);
    if (!content) continue;
    sections.push(`${header}\n${content}`);
  }

  if (extraSuffix && typeof extraSuffix === 'string' && extraSuffix.trim()) {
    sections.push(extraSuffix.trim());
  }

  return sections.join('\n\n');
}

export default async function handler(req, res) {
  // Same-origin friendly CORS (harmless if served from same domain).
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: { type: 'method_not_allowed', message: 'Only POST is supported on /api/chat.' }
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[workflow-advisor] ANTHROPIC_API_KEY is not configured.');
    return res.status(500).json({
      error: {
        type: 'configuration_error',
        message: "The Advisor isn't fully configured yet. Please try again later or contact support."
      }
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (err) {
      return res.status(400).json({
        error: { type: 'invalid_request', message: 'Request body must be valid JSON.' }
      });
    }
  }

  const { messages, testingSuffix } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: { type: 'invalid_request', message: 'Request must include a non-empty messages array.' }
    });
  }

  const systemPrompt = buildSystemPrompt(testingSuffix);

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages
      })
    });

    const data = await anthropicRes.json();
    return res.status(anthropicRes.status).json(data);
  } catch (err) {
    console.error('[workflow-advisor] Anthropic API call failed:', err);
    return res.status(502).json({
      error: {
        type: 'upstream_error',
        message: 'The Advisor had trouble reaching its brain. Please try again in a moment.'
      }
    });
  }
}
