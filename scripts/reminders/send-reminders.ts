import { resolve as resolvePath } from 'node:path';
import { loadRuntimeSettings, resolveEnvValue } from './env';
import { ReminderDefinition, TextReminder } from './reminder-model';
import { loadRemindersFile } from './reminders-file';
import { getLocalDateParts, isReminderDue } from './scheduler';
import { applyTemplate, buildTemplateContext } from './template';
import { WhapiClient } from './whapi-client';

function resolveTarget(reminder: ReminderDefinition, defaultTargetEnv?: string): string {
  if (reminder.target?.trim()) {
    return reminder.target.trim();
  }

  const envName = reminder.targetEnv || defaultTargetEnv || 'WHAPI_GROUP_ID';
  return resolveEnvValue(envName);
}

function resolveMentions(reminder: TextReminder): string[] {
  const direct = reminder.mentionPhones ?? [];
  const fromEnv = (reminder.mentionPhoneEnvs ?? []).map((key) => resolveEnvValue(key));
  return [...direct, ...fromEnv];
}

async function sendReminder(
  client: WhapiClient,
  reminder: ReminderDefinition,
  defaultTargetEnv: string | undefined,
  nowContext: ReturnType<typeof buildTemplateContext>
): Promise<void> {
  const target = resolveTarget(reminder, defaultTargetEnv);

  if (reminder.type === 'text') {
    const mentions = resolveMentions(reminder);
    const body = applyTemplate(reminder.message, nowContext);

    await client.sendTextMessage({
      to: target,
      body,
      mentions,
    });

    return;
  }

  const question = applyTemplate(reminder.question, nowContext);

  await client.sendPoll({
    to: target,
    title: question,
    options: reminder.options,
  });
}

async function run(): Promise<void> {
  const settings = loadRuntimeSettings();
  const remindersFilePath = resolvePath(settings.remindersFilePath);
  const data = await loadRemindersFile(remindersFilePath);
  const localNow = getLocalDateParts(data.timezone);

  const dueReminders = data.reminders.filter((reminder) =>
    isReminderDue(reminder, localNow, settings.dueToleranceMinutes)
  );

  console.log(
    `Loaded ${data.reminders.length} reminders from ${remindersFilePath}. Due now: ${dueReminders.length}.`
  );

  if (dueReminders.length === 0) {
    return;
  }

  const templateContext = buildTemplateContext(localNow);
  const client = new WhapiClient(settings.whapiBaseUrl, settings.whapiToken);

  for (const reminder of dueReminders) {
    console.log(`Sending reminder: ${reminder.id}`);
    await sendReminder(client, reminder, data.defaultTargetEnv, templateContext);
  }

  console.log('All due reminders sent successfully.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
