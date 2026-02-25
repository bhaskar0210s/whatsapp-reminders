import { readFile } from 'node:fs/promises';
import { ReminderDefinition, ReminderSchedule, RemindersFileData, WeekdayCode } from './reminder-model';

function fail(message: string): never {
  throw new Error(`Invalid reminders.md format: ${message}`);
}

function extractJsonBlock(markdown: string): string {
  const match = markdown.match(/```json\s*([\s\S]*?)```/i);
  if (!match?.[1]) {
    fail('Missing ```json ... ``` block.');
  }
  return match[1].trim();
}

function assertObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function assertString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    fail(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

function assertStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    fail(`${label} must be an array of non-empty strings.`);
  }
  return value.map((item) => item.trim());
}

function assertInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value)) {
    fail(`${label} must be an integer.`);
  }
  return value as number;
}

function parseSchedule(raw: unknown, reminderId: string): ReminderSchedule {
  const schedule = assertObject(raw, `schedule for ${reminderId}`);
  const kind = assertString(schedule.kind, `schedule.kind for ${reminderId}`).toLowerCase();
  const time = assertString(schedule.time, `schedule.time for ${reminderId}`);

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    fail(`schedule.time for ${reminderId} must be HH:MM in 24-hour format.`);
  }

  if (kind === 'daily') {
    return { kind: 'daily', time };
  }

  if (kind === 'weekly') {
    const day = assertString(schedule.day, `schedule.day for ${reminderId}`).toLowerCase();
    if (!['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(day)) {
      fail(`schedule.day for ${reminderId} must be one of sun|mon|tue|wed|thu|fri|sat.`);
    }
    return { kind: 'weekly', day: day as WeekdayCode, time };
  }

  if (kind === 'monthly') {
    const day = assertInteger(schedule.day, `schedule.day for ${reminderId}`);
    if (day < 1 || day > 31) {
      fail(`schedule.day for ${reminderId} must be between 1 and 31.`);
    }
    return { kind: 'monthly', day, time };
  }

  if (kind === 'yearly') {
    const month = assertInteger(schedule.month, `schedule.month for ${reminderId}`);
    const day = assertInteger(schedule.day, `schedule.day for ${reminderId}`);
    if (month < 1 || month > 12) {
      fail(`schedule.month for ${reminderId} must be between 1 and 12.`);
    }
    if (day < 1 || day > 31) {
      fail(`schedule.day for ${reminderId} must be between 1 and 31.`);
    }
    return { kind: 'yearly', month, day, time };
  }

  fail(`Unsupported schedule.kind for ${reminderId}: ${kind}`);
}

function parseReminder(raw: unknown, index: number): ReminderDefinition {
  const item = assertObject(raw, `reminders[${index}]`);

  const id = assertString(item.id, `reminders[${index}].id`);
  const title = assertString(item.title, `reminders[${index}].title`);
  const type = assertString(item.type, `reminders[${index}].type`).toLowerCase();

  const schedule = parseSchedule(item.schedule, id);
  const target = typeof item.target === 'string' ? item.target.trim() : undefined;
  const targetEnv = typeof item.targetEnv === 'string' ? item.targetEnv.trim() : undefined;

  if (type === 'text') {
    const message = assertString(item.message, `${id}.message`);
    const mentionPhones = Array.isArray(item.mentionPhones)
      ? assertStringArray(item.mentionPhones, `${id}.mentionPhones`)
      : undefined;
    const mentionPhoneEnvs = Array.isArray(item.mentionPhoneEnvs)
      ? assertStringArray(item.mentionPhoneEnvs, `${id}.mentionPhoneEnvs`)
      : undefined;

    return {
      id,
      title,
      type: 'text',
      schedule,
      target,
      targetEnv,
      message,
      mentionPhones,
      mentionPhoneEnvs,
    };
  }

  if (type === 'poll') {
    const question = assertString(item.question, `${id}.question`);
    const options = assertStringArray(item.options, `${id}.options`);
    if (options.length < 2) {
      fail(`${id}.options should contain at least 2 entries.`);
    }

    return {
      id,
      title,
      type: 'poll',
      schedule,
      target,
      targetEnv,
      question,
      options,
    };
  }

  fail(`Unsupported reminder type for ${id}: ${type}`);
}

export async function loadRemindersFile(filePath: string): Promise<RemindersFileData> {
  const rawMarkdown = await readFile(filePath, 'utf8');
  const jsonText = extractJsonBlock(rawMarkdown);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`Invalid JSON in reminders.md: ${String(error)}`);
  }

  const root = assertObject(parsed, 'root');
  const timezone = assertString(root.timezone, 'timezone');
  const defaultTargetEnv =
    typeof root.defaultTargetEnv === 'string' && root.defaultTargetEnv.trim()
      ? root.defaultTargetEnv.trim()
      : undefined;

  if (!Array.isArray(root.reminders)) {
    fail('reminders must be an array.');
  }

  const reminders = root.reminders.map((entry, index) => parseReminder(entry, index));
  if (reminders.length === 0) {
    fail('reminders array must not be empty.');
  }

  return {
    timezone,
    defaultTargetEnv,
    reminders,
  };
}
