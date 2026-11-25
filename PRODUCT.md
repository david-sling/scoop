# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML and CSS for mockups, chosen by David on Nov 26, 2026. The stack for the real app is not decided.

## Users

One person who works with AI agents every day. They use Scoop alone, for their own mail, links and notifications. It is not a team tool.

## Product Purpose

Scoop is a personal inbox for an AI agent. It collects things while the agent is not running, and the agent reads, searches and organises them over MCP when a session starts. Success is an agent that can ask "what's new since I last looked", triage it, and find the same labels and notes in the next session.

## Positioning

Read-later apps are built for a person to read, and automation tools act the moment an event fires. In Scoop the reader is the agent, and nothing happens until the agent, with the person present, decides what matters. Among David's tools, Wave answers "another agent", Valet answers "a person with no agent", and Scoop answers "nobody yet".

## Operating Context

- Items arrive by the agent's email address (`username@scoop.davidsling.in`, with per-source aliases), a webhook, a Chrome extension and, later, app connectors such as Slack and GitHub.
- The agent reaches the inbox only through an MCP that reads and organises.
- The person uses the web dashboard to see what the agent will see, manage quarantine and sources, and delete things. The dashboard's home screen is the inbox (confirmed by David on Nov 26, 2026).

## Capabilities and Constraints

- Every source produces one item shape: source, sender, time, original content, state, labels, priority.
- Originals never change. Transcripts, article text and summaries are layers added beside the original.
- Each agent has a cursor that records where it stopped reading.
- Labels, priorities and notes written by the agent persist between sessions.
- Each item carries a trust level. The person's own capture note is trusted. All other content is untrusted data.
- Mail from unknown senders goes to quarantine.
- The MCP cannot send, post, pay, change connector settings or delete an original.
- Undecided: pricing, hosted or self-hosted, default retention, several agents per person from day one.

Full detail is in `PLAN.md`.

## Brand Commitments

- Name: Scoop, at `scoop.davidsling.in`. The trademark and name-clash check is still open.
- Logo: David's scoop character with the name. Tidy is the main style and Solid is the fallback. Files and rules are in `brand/lockup-v2/`.
- Colours in the logo: pink `#FFABDA`, mauve `#9F527C`, white.
- Not decided: the interface font and the full colour palette.

## Evidence on Hand

- `PLAN.md` and the logo files.
- No real users, usage data, testimonials or screenshots exist. Mockups use invented sample data and must not present it as real.

## Product Principles

- The agent is the reader. The dashboard shows the person what the agent will see.
- Read and organise only. Acting on an item is a separate, approved step.
- Everything from outside is untrusted, and the interface says so plainly.
- Rules decide, not models: routing, quarantine and first-pass priority are deterministic.
- Nothing is lost: originals are kept as received, and deletion is real when the person asks for it.
