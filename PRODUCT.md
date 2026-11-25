# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML and CSS for mockups, chosen by David on Nov 26, 2026. The stack for the real app is not decided.

## Users

One person who makes things with AI agents every day, starting with designers and developers. They collect references while browsing and reading, and want their agent to use them when a project starts. They use Scoop alone. It is not a team tool.

## Product Purpose

Scoop is a personal library for an AI agent. The person saves posts, pages, videos and images they like, and subscribes to newsletters through the agent's own address. When a project needs ideas, the agent searches the library over MCP and picks what fits. Success is an agent that finds the right handful of references from hundreds, and that understands the person's taste from what they saved.

Scoop is not a task manager. It holds no to-dos, deadlines or replies to send. Confirmed by David on Nov 26, 2026.

## Positioning

Bookmarking and read-later apps are built for a person to browse. In Scoop the main reader is the agent, and it arrives with a project in mind. Project decisions do not live in Scoop: they go in the project's own report, and Scoop is only the source. Among David's tools, Wave connects an agent to another agent, Valet connects it to a person with no agent, and Scoop gives it what its own person has collected.

## Operating Context

- The person saves things with one click from a Chrome extension while browsing, often on X, and adds a short note on why.
- Newsletters about AI, animation libraries and component libraries arrive at the agent's address (`username@scoop.davidsling.in`).
- At the start of a piece of work, the person creates a project in Scoop, adds the saves they want used, and points their agent at it. They can also ask the agent to go through the whole library and add what fits.
- The agent reaches the library only through an MCP that searches, reads and organises.
- The web dashboard is where the person browses and searches the library themselves, and sees what their agents pulled. Its home screen is the library, not a list of things to act on.

## Capabilities and Constraints

- Every source produces one item shape: source, sender, time, original content, tags and notes.
- Scoop runs no AI of its own. It does not tag, summarise, transcribe or search by meaning. Confirmed by David on Nov 26, 2026.
- Every save arrives untagged. It stays that way until an agent or the person tags it. A save can carry several tags. Agents and the person can both create, rename, merge, reorder and delete tags. An agent is instructed to ask the person for permission before it renames, merges, reorders or deletes. Scoop cannot enforce that, so every tag change by an agent can be undone in the dashboard. Confirmed by David on Nov 26, 2026. Scoop records who added each tag. The word is "tags", never "categories" or "classes". Confirmed by David on Nov 26, 2026.
- Originals never change. Extracted text, existing captions and agent-written fields are added beside the original.
- Each agent has a cursor that records where it stopped reading. This matters less for a library than it did for an inbox.
- Tags and notes written by an agent or the person persist between sessions.
- Tools as saves: a save can be an MCP server or a skill, stored as its own address, as its landing page, or by name only when an agent already has it. Scoop never installs or runs a tool and stores no secrets. An agent may use a saved tool only when the person added it to the project themselves. Described and confirmed by David on Nov 26, 2026, including the rule that an agent uses a saved tool only when the person added it to the project.
- Projects: the person creates a project and adds the saves they want used for it. It guides the agent and does not restrict it, and the agent can add more saves when asked. When an agent reports using a save, it names the project and gives a short description of how it was used. If the project does not exist, Scoop creates it. Agents choose from the existing project list so one project is not recorded under two spellings. Confirmed by David on Nov 26, 2026.
- Each item carries a trust level. The person's own capture note is trusted. All other content is untrusted data.
- Mail from unknown senders goes to quarantine.
- Agents can organise anything: tag, rename, merge, reorder, archive and delete saves, tags and projects. They are instructed to ask the person first, and every change they make can be undone in the dashboard. A messy library is not treated as a risk. Decided by David on Nov 26, 2026.
- What agents still cannot do (confirmed by David on Nov 26, 2026): release quarantined senders, use a tool the person has not approved, edit the person's own note or change who something is credited to, change an original, erase anything for good, manage agents, sources or account settings, or send, post or pay.
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

- A library, not a to-do list. Nothing in Scoop asks the person to act.
- Scoop stores, the agent thinks. Anything that needs judgement is done by the person's agent, not by Scoop.
- Saving takes one click. Anything slower and the person will not do it mid-scroll.
- The agent is the main reader, and it comes with a question.
- The person's own note and choices are the signal. They show taste better than any page content.
- Scoop is a source. Decisions belong to the project's own files. Scoop keeps only which saves a project holds and how each was used.
- Everything from outside is untrusted, and originals are kept as received.
