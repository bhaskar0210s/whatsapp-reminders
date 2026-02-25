# WhatsApp Reminders

Automated WhatsApp reminders powered by TypeScript + GitHub Actions.

The system is driven by a single file: `reminder.json`.
All schedules, reminder text, poll options, and target chat env mappings are defined there.

## Architecture

- `reminder.json`:
  - source of truth for reminder definitions
  - contains all schedules and templates as JSON
- `scripts/reminders/send-reminders.ts`:
  - loads `reminder.json`
  - evaluates what is due for current time in configured timezone
  - sends text messages and polls through Whapi
- `scripts/reminders/list-groups.ts`:
  - utility to discover group/chat ids from Whapi
- `.github/workflows/whatsapp-reminders.yml`:
  - runs every 5 minutes and sends only due reminders

## Reminder types supported

- `text`
- `poll`

## Schedule types supported

- `daily` (time)
- `weekly` (day + time)
- `monthly` (day + time)
- `yearly` (month + day + time)

## Local setup

```bash
npm install
npm run build
cp .env.example .env
```

Set required values in `.env`:
- `WHAPI_API_TOKEN`
- `WHAPI_GROUP_ID` (fallback/default group)

Then run:

```bash
npm run reminders:run
```

## Useful commands

```bash
npm run build
npm run reminders:run
npm run reminders:list-groups
```

## Notes

- If GitHub Actions starts late by a minute or two, `REMINDER_DUE_TOLERANCE_MINUTES` allows due reminders to still fire.
- Placeholders available in templates: `{{date}}`, `{{weekday}}`, `{{month}}`, `{{day}}`, `{{year}}`, `{{time}}`.
