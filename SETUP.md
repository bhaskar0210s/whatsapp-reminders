# Setup Guide

## 1. Install locally

```bash
npm install
npm run build
```

## 2. Configure secrets / env

Use `.env.example` as reference.

Minimum required:
- `WHAPI_API_TOKEN`
- `WHAPI_GROUP_ID`

Optional (used by sample reminders):
- `HOUSEHOLD_GROUP_ID`
- `FAMILY_GROUP_ID`
- `COOK_MENTION_PHONE`
- `WHAPI_BASE_URL` (defaults to `https://gate.whapi.cloud`)

## 3. Maintain reminders in one file

Edit `reminders.md` only.

The first JSON code block controls:
- timezone
- default target env
- reminder list
- reminder type (`text` or `poll`)
- schedule (`daily`, `weekly`, `monthly`, `yearly`)

## 4. Discover WhatsApp group id

```bash
WHAPI_API_TOKEN=your_token npm run reminders:list-groups
```

Copy the right group id into `WHAPI_GROUP_ID` or a specific target env used in `reminders.md`.

## 5. Test run

```bash
npm run reminders:run
```

If nothing is due for current time, the script exits without sending.

## 6. GitHub Actions

Workflow file:
- `.github/workflows/whatsapp-reminders.yml`

It runs every 5 minutes and calls:
- `node dist/scripts/reminders/send-reminders.js`

Make sure repository secrets include all env variables referenced by your `reminders.md` entries.
