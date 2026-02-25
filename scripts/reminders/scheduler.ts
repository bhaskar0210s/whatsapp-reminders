import { LocalDateParts, ReminderDefinition, ReminderSchedule, WeekdayCode } from './reminder-model';

const WEEKDAY_SET: WeekdayCode[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function toNumber(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  const value = parts.find((part) => part.type === type)?.value;
  if (!value) {
    throw new Error(`Unable to resolve date part: ${type}`);
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Unable to parse numeric date part: ${type}`);
  }

  return parsed;
}

function resolveWeekday(parts: Intl.DateTimeFormatPart[]): WeekdayCode {
  const raw = parts.find((part) => part.type === 'weekday')?.value.toLowerCase().slice(0, 3);
  if (!raw || !WEEKDAY_SET.includes(raw as WeekdayCode)) {
    throw new Error('Unable to resolve weekday for timezone.');
  }

  return raw as WeekdayCode;
}

export function getLocalDateParts(timezone: string, date: Date = new Date()): LocalDateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  return {
    year: toNumber(parts, 'year'),
    month: toNumber(parts, 'month'),
    day: toNumber(parts, 'day'),
    weekday: resolveWeekday(parts),
    hour: toNumber(parts, 'hour'),
    minute: toNumber(parts, 'minute'),
  };
}

function parseTimeToMinutes(time: string): number {
  const [hourPart, minutePart] = time.split(':');
  const hour = Number.parseInt(hourPart, 10);
  const minute = Number.parseInt(minutePart, 10);
  return hour * 60 + minute;
}

function scheduleMatchesDate(schedule: ReminderSchedule, now: LocalDateParts): boolean {
  if (schedule.kind === 'daily') return true;
  if (schedule.kind === 'weekly') return schedule.day === now.weekday;
  if (schedule.kind === 'monthly') return schedule.day === now.day;
  return schedule.month === now.month && schedule.day === now.day;
}

function scheduleTimeMatches(
  schedule: ReminderSchedule,
  now: LocalDateParts,
  toleranceMinutes: number
): boolean {
  const nowMinutes = now.hour * 60 + now.minute;
  const scheduleMinutes = parseTimeToMinutes(schedule.time);
  return Math.abs(nowMinutes - scheduleMinutes) <= toleranceMinutes;
}

export function isReminderDue(
  reminder: ReminderDefinition,
  now: LocalDateParts,
  toleranceMinutes: number
): boolean {
  return (
    scheduleMatchesDate(reminder.schedule, now) &&
    scheduleTimeMatches(reminder.schedule, now, toleranceMinutes)
  );
}
