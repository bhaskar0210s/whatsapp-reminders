import { LocalDateParts } from './reminder-model';

interface TemplateContext {
  date: string;
  weekday: string;
  month: string;
  day: string;
  time: string;
  year: string;
}

const WEEKDAY_LABELS: Record<string, string> = {
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function buildTemplateContext(local: LocalDateParts): TemplateContext {
  return {
    date: `${local.year}-${pad(local.month)}-${pad(local.day)}`,
    weekday: WEEKDAY_LABELS[local.weekday],
    month: pad(local.month),
    day: pad(local.day),
    time: `${pad(local.hour)}:${pad(local.minute)}`,
    year: String(local.year),
  };
}

export function applyTemplate(template: string, context: TemplateContext): string {
  return template.replace(/\{\{\s*([a-zA-Z_]+)\s*\}\}/g, (_, key: string) => {
    const value = context[key as keyof TemplateContext];
    return value ?? `{{${key}}}`;
  });
}
