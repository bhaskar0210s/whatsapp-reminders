export interface RuntimeSettings {
  whapiToken: string;
  whapiBaseUrl: string;
  remindersFilePath: string;
  dueToleranceMinutes: number;
}

function readRequiredEnv(key: string): string {
  const value =
    process.env[key]?.trim() || (key === 'WHAPI_API_TOKEN' ? process.env.WHAPI_TOKEN?.trim() : undefined);
  if (!value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

function readOptionalEnv(key: string): string | null {
  const value = process.env[key]?.trim();
  return value || null;
}

function parsePositiveInt(raw: string | null, fallback: number, key: string): number {
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${key} must be a positive integer. Received: ${raw}`);
  }
  return value;
}

function normalizeBaseUrl(raw: string | null): string {
  const baseUrl = raw ?? 'https://gate.whapi.cloud';
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

export function loadRuntimeSettings(): RuntimeSettings {
  return {
    whapiToken: readRequiredEnv('WHAPI_API_TOKEN'),
    whapiBaseUrl: normalizeBaseUrl(readOptionalEnv('WHAPI_BASE_URL')),
    remindersFilePath: readOptionalEnv('REMINDERS_FILE') ?? 'reminder.json',
    dueToleranceMinutes: parsePositiveInt(readOptionalEnv('REMINDER_DUE_TOLERANCE_MINUTES'), 2, 'REMINDER_DUE_TOLERANCE_MINUTES'),
  };
}

export function resolveEnvValue(key: string): string {
  return readRequiredEnv(key);
}
