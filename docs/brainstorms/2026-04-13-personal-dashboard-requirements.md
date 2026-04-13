# Personal Dashboard — Requirements

**Date:** 2026-04-13
**Status:** Ready for planning
**Scope:** Single-user web dashboard combining today's Google Calendar events (with alarms), a todo list, and quick notes.

## Problem & Motivation

I want a single-page personal dashboard that gives me, at a glance:
- Today's schedule from my Google Calendar
- Audible + visual alarms before each event
- A lightweight todo list
- A quick-capture notes area

Opening Google Calendar, a notes app, and a task app separately is friction. One focused page that lives in a browser tab is the goal.

## Users

- **Just me.** Single-user. No sign-up, no multi-tenancy.
- Auth to Google Calendar is a one-time OAuth consent; server stores the refresh token.

## Goals

- See today's events ranked by start time, with visual time-until indicators.
- Never miss an event — a global fixed-offset reminder fires a desktop notification + sound before every event.
- Capture and manage todos with priority + due date in one place.
- Jot and keep multiple short notes without friction.
- Editorial/magazine aesthetic: serif display type, generous whitespace, asymmetric grid — not another generic dashboard.

## Non-Goals

- No multi-user / accounts system.
- No full week/month calendar view. **Today only.**
- No creating or editing Google Calendar events from the dashboard (read-only).
- No per-event custom alarm configuration in the dashboard (fixed global offset is enough).
- No mobile-native push (browser tab must be open for alarms).
- No rich markdown / tagging / search for notes — keep them short.
- No collaborative features.

## Functional Requirements

### 1. Calendar — Today's Events

- Read events from my primary Google Calendar for the current day (local timezone).
- Display in chronological order: `HH:MM · Title` with event duration and a subtle "in Xh Ym" relative indicator that updates live.
- Visually distinguish events that are: upcoming, current (happening now), and past (de-emphasized).
- Background refresh from Google Calendar at a sensible interval (e.g., every few minutes). Stale data must not cause missed alarms — refresh also happens on tab focus.
- Read-only. Click-through to the event in Google Calendar is acceptable but not required.

### 2. Alarms

- **Global fixed offset**, configurable from the dashboard (e.g., 5 minutes before; stored in MongoDB).
- Single offset applies to every event of the day.
- When an event is `offset` minutes away:
  - Fire a browser desktop notification (title + start time).
  - Play a short audible chime.
- Each event fires its alarm **at most once per day** (track fired state so a tab refresh doesn't re-fire).
- Require notification permission on first load; show a clear prompt if denied.
- Works only while the dashboard tab is open — this is an accepted limitation.

### 3. Todo List

- Add a todo with: text, priority (High / Medium / Low), optional due date.
- Check off / uncheck; delete.
- Sort order: incomplete first, then by priority, then by due date ascending. Completed items fall to a collapsed "Done" section.
- Overdue items are visually flagged.
- Persisted to MongoDB Atlas.

### 4. Notes

- Multiple short note cards (title optional, body is short free text).
- Add, edit inline, delete.
- Most-recently-edited first.
- Persisted to MongoDB Atlas.

### 5. Layout (single page)

- Three regions on one page, no routing:
  - **Top:** Today's schedule (dominant).
  - **Bottom-left:** Todos.
  - **Bottom-right:** Notes.
- Responsive enough to be usable on a laptop; mobile is a nice-to-have, not required.

### 6. Aesthetic

- **Editorial / magazine** direction.
- Serif display font for headings (distinctive, not a generic default).
- Refined sans or mono for body/meta.
- Generous whitespace, asymmetric grid, clear typographic hierarchy.
- Dominant neutral palette with a single characterful accent.

## Technical Direction

Captured here because the stack was part of the brainstorm. Detailed design belongs in planning.

- **Framework:** Nuxt 3 (SSR-capable, server routes handle Google OAuth + MongoDB).
- **Hosting:** AWS Amplify Hosting.
- **Data store:** MongoDB Atlas (todos, notes, settings, Google OAuth refresh token).
- **Calendar API:** Google Calendar API via server-side call using stored refresh token.
- **Alarms:** Browser Notification API + HTMLAudioElement, driven by a client-side scheduler.

## Success Criteria

- I can open the dashboard in a browser tab and see today's Google Calendar events within ~2 seconds.
- At `offset` minutes before each event, I reliably get a desktop notification and chime (assuming the tab is open and permission granted).
- I can add, complete, and delete todos and notes; data persists across refreshes and devices.
- Visual design feels clearly editorial — not a generic dashboard template.
- Deployed live on AWS Amplify from the project repo.

## Open Questions (for planning)

- Default fixed alarm offset (5 minutes? configurable via a small settings affordance on the page?).
- Google OAuth flow: one-time CLI/local setup to seed the refresh token, or a first-run web flow?
- Notification permission UX when denied — inline banner or modal?
- Refresh cadence for Google Calendar polling vs. on-focus only.
- Timezone handling if I travel (stick to browser local, or persist a configured timezone?).
