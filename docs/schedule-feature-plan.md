# Schedule Feature — Implementation Plan

## What We're Building

The schedule page had all its visual components already designed and looking great, but nothing was actually working. Sessions were hardcoded, clicking Previous/Next week did nothing, the Day and Month view buttons did nothing, and the "Now" time indicator was a fixed number. This plan describes what was built to make it all live and functional.

---

## The Problem (Before)

| Thing | Status |
|---|---|
| Week navigation (← →) | Buttons existed but did nothing |
| "Today" button | Did nothing |
| Day view | Toggle worked visually but showed nothing |
| Month view | Same — no content |
| Session data | Hardcoded directly in the page file |
| "Now" red line | Fixed pixel number, never moved |
| Week label ("April 14 – 20") | Hardcoded string |
| Sidebar session list | Hardcoded data |

---

## What Was Built (After)

### 1. Calendar Math (`utils/calendar.ts`)
A set of helper functions that do all the date and pixel math. Think of this as the "calculator" that the rest of the app uses.

- **Converts time → pixels** — The calendar grid is 56px per hour, starting at 7 AM. If a session starts at 10 AM, this calculates it should appear at pixel 168 from the top.
- **Calculates where "Now" is** — Same math, but using the current time from the user's clock.
- **Builds the 7-day week** — Given a Monday date, produces Mon/Tue/Wed… through Sun with formatted names and numbers.
- **Formats the week label** — Turns a date into "April 14 – 20, 2026" (or "Apr 28 – May 4, 2026" if the week crosses months).
- **Builds the month grid** — Creates a 6-row × 7-column grid of day cells for the month view.

---

### 2. Schedule State (`composables/useScheduleState.ts`)
This manages everything about *which week/day/view* is being looked at. It's the "memory" of the calendar.

- **Remembers the current week** — Stored in the page URL as `?week=2026-04-14` so sharing the link takes you to the same week.
- **Remembers the current view** — Stored as `?view=week`, `?view=day`, or `?view=month`. Refreshing keeps your view.
- **Navigation functions** — `prevWeek()`, `nextWeek()`, `goToday()`, `goToDay(date)`.
- **Live "Now" clock** — Updates the position of the red "Now" line every 60 seconds using the real system time.

---

### 3. Schedule Data (`composables/useScheduleData.ts`)
This is the "data pipeline" — it fetches sessions from the API and transforms them into the shape the calendar components need.

- **Fetches from the API** — When you navigate to a different week, it automatically re-fetches sessions for that week's date range.
- **Places sessions on the grid** — Takes each session's start time and duration, converts to pixels using the math from step 1, and assigns it to the correct day column.
- **Builds the sidebar list** — Groups upcoming sessions by day for the "This Week" panel on the right.
- **Calculates stats** — Counts confirmed vs. total sessions, total hours coached.
- **Refreshes after scheduling** — When you schedule a new session, the calendar reloads to show it immediately.

---

### 4. Day View (`components/CalendarDayView.vue`)
A single-column version of the weekly calendar for when you're focused on one specific day.

- Same time grid (7 AM – 8 PM, 56px per hour)
- Sessions appear full-width with more detail visible (no truncation)
- Shows confirmation status (✓ badge or "Pending" label)
- Same "Now" indicator and unavailable blocks

---

### 5. Month View (`components/CalendarMonthView.vue`)
A traditional monthly calendar grid.

- 7 columns (Mon–Sun) × up to 6 rows
- Today's date gets a green circle
- Each day shows coloured session dots (blue = Zoom, green = In-Person, purple = Group)
- Shows up to 3 dots, then "+ N more" if there are extras
- Days outside the current month are slightly dimmed
- Clicking any day switches to the Day view for that date

---

### 6. Updated Schedule Page (`pages/schedule.vue`)
The page that ties everything together. All hardcoded data was removed and replaced with composable outputs.

- Week label, subtitle, and session data all come from the composables
- The three view components (Week/Day/Month) swap in/out based on the selected view
- Navigation buttons are wired to real functions
- After scheduling a session, the calendar refreshes automatically

---

## How the Pieces Connect

```
User clicks ← or → button
        ↓
  useScheduleState updates currentWeek in the URL
        ↓
  useScheduleData detects the change and re-fetches sessions
        ↓
  Sessions are converted to pixel positions
        ↓
  CalendarGrid / CalendarDayView / CalendarMonthView re-renders
```

```
Every 60 seconds
        ↓
  useScheduleState recalculates nowTop() from the system clock
        ↓
  The red "Now" line moves to the correct position
```

---

## URL Structure

The calendar state is bookmarkable and shareable:

| URL | What it shows |
|---|---|
| `/schedule` | Current week, week view |
| `/schedule?week=2026-05-19` | Specific week, week view |
| `/schedule?view=month` | Current month view |
| `/schedule?view=day&day=2026-05-21` | Day view for May 21 |

---

## Files Changed or Created

| File | What it is |
|---|---|
| `utils/calendar.ts` | ✨ New — date/pixel math helpers |
| `composables/useScheduleState.ts` | ✨ New — navigation, view, URL sync, live clock |
| `composables/useScheduleData.ts` | ✨ New — API fetch + data transformation |
| `components/CalendarDayView.vue` | ✨ New — single-day calendar column |
| `components/CalendarMonthView.vue` | ✨ New — monthly grid with session dots |
| `pages/schedule.vue` | ♻️ Updated — hardcoded data removed, composables wired in |

Everything else (`CalendarGrid.vue`, `SessionBlock.vue`, `ScheduleSidePanel.vue`, `SessionPopover.vue`, etc.) was left untouched — it already worked.
