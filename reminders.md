# Reminders Source Of Truth

All reminder schedules and message templates live in this file.

How it works:
- The automation script reads the first `json` code block below.
- `schedule.time` uses 24-hour `HH:MM`.
- `targetEnv` points to an environment variable that stores a WhatsApp chat/group id.
- Templates support: `{{date}}`, `{{weekday}}`, `{{month}}`, `{{day}}`, `{{year}}`, `{{time}}`.

```json
{
  "timezone": "Asia/Kolkata",
  "defaultTargetEnv": "WHAPI_GROUP_ID",
  "reminders": [
    {
      "id": "family-chore-rotation",
      "title": "Family Chore Rotation",
      "type": "text",
      "schedule": { "kind": "weekly", "day": "sun", "time": "09:00" },
      "targetEnv": "HOUSEHOLD_GROUP_ID",
      "message": "Family chore rotation for the week ({{date}}): assign kitchen, cleaning, laundry, and grocery tasks.",
      "mentionPhoneEnvs": ["COOK_MENTION_PHONE"]
    },
    {
      "id": "bill-due-reminder",
      "title": "Bill Due Reminder",
      "type": "text",
      "schedule": { "kind": "monthly", "day": 1, "time": "10:00" },
      "message": "New month started on {{date}}. Please check electricity, internet, and rent due dates."
    },
    {
      "id": "weekly-grocery-plan",
      "title": "Weekly Grocery + Owner",
      "type": "poll",
      "schedule": { "kind": "weekly", "day": "sat", "time": "11:00" },
      "question": "Who will handle grocery shopping this weekend?",
      "options": ["I will", "Need someone else", "Split between 2 people"]
    },
    {
      "id": "birthday-reminder",
      "title": "Birthday Reminder",
      "type": "text",
      "schedule": { "kind": "yearly", "month": 12, "day": 10, "time": "09:00" },
      "targetEnv": "FAMILY_GROUP_ID",
      "message": "Birthday reminder for {{month}}/{{day}}: finalize gift and celebration plan today."
    },
    {
      "id": "subscription-renewals",
      "title": "Monthly Subscription Renewals",
      "type": "text",
      "schedule": { "kind": "monthly", "day": 25, "time": "09:30" },
      "message": "Subscription check for {{month}}/{{year}}: review OTT, cloud, and app renewals before charges hit."
    },
    {
      "id": "weekend-entertainment",
      "title": "Weekend Entertainment",
      "type": "poll",
      "schedule": { "kind": "weekly", "day": "fri", "time": "18:00" },
      "question": "Pick this weekend activity:",
      "options": ["Movie night", "Dinner out", "Home board games"]
    }
  ]
}
```
