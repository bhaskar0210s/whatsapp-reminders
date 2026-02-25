import { loadRuntimeSettings } from './env';
import { WhapiClient } from './whapi-client';

function normalizeCollection(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null);
  }

  if (payload && typeof payload === 'object') {
    const node = payload as Record<string, unknown>;
    const nested = node.data ?? node.chats ?? node.groups;
    if (Array.isArray(nested)) {
      return nested.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null);
    }
  }

  return [];
}

function print(items: Record<string, unknown>[]): void {
  if (items.length === 0) {
    console.log('No groups found.');
    return;
  }

  console.log('Groups/chats from Whapi:\n');
  items.forEach((item, index) => {
    const name = String(item.name ?? item.title ?? item.subject ?? '(no name)');
    const id = String(item.id ?? item.chat_id ?? item.jid ?? item.group_id ?? '(no id)');

    console.log(`${index + 1}. ${name}`);
    console.log(`   id: ${id}`);
    console.log('');
  });
}

async function run(): Promise<void> {
  const settings = loadRuntimeSettings();
  const client = new WhapiClient(settings.whapiBaseUrl, settings.whapiToken);

  try {
    const groups = await client.fetchGroups();
    print(normalizeCollection(groups));
    return;
  } catch (error) {
    console.error('Failed to fetch /groups, retrying with /chats');
    console.error(String(error));
  }

  const chats = await client.fetchChats();
  print(normalizeCollection(chats));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
