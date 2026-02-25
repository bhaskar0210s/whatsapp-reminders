export type ReminderType = 'text' | 'poll';
export type WeekdayCode = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export type ReminderSchedule =
  | { kind: 'daily'; time: string }
  | { kind: 'weekly'; day: WeekdayCode; time: string }
  | { kind: 'monthly'; day: number; time: string }
  | { kind: 'yearly'; month: number; day: number; time: string };

interface ReminderBase {
  id: string;
  title: string;
  type: ReminderType;
  schedule: ReminderSchedule;
  target?: string;
  targets?: string[];
  targetEnv?: string;
  targetEnvs?: string[];
}

export interface TextReminder extends ReminderBase {
  type: 'text';
  message: string;
  mentionPhones?: string[];
  mentionPhoneEnvs?: string[];
}

export interface PollReminder extends ReminderBase {
  type: 'poll';
  question: string;
  options: string[];
}

export type ReminderDefinition = TextReminder | PollReminder;

export interface RemindersFileData {
  timezone: string;
  defaultTargetEnv?: string;
  reminders: ReminderDefinition[];
}

export interface LocalDateParts {
  year: number;
  month: number;
  day: number;
  weekday: WeekdayCode;
  hour: number;
  minute: number;
}
