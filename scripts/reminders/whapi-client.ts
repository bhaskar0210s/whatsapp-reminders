interface TextMessagePayload {
  to: string;
  body: string;
  mentions?: string[];
}

interface PollPayload {
  to: string;
  title: string;
  options: string[];
}

export class WhapiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string
  ) {}

  async sendTextMessage(payload: TextMessagePayload): Promise<void> {
    await this.request('/messages/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: payload.to,
        body: payload.body,
        mentions: payload.mentions ?? [],
      }),
    });
  }

  async sendPoll(payload: PollPayload): Promise<void> {
    const form = new FormData();
    form.append('to', payload.to);
    form.append('title', payload.title);
    form.append('options', JSON.stringify(payload.options));

    await this.request('/messages/poll', {
      method: 'POST',
      body: form,
    });
  }

  async fetchGroups(): Promise<unknown> {
    return this.request('/groups', { method: 'GET' });
  }

  async fetchChats(): Promise<unknown> {
    return this.request('/chats', { method: 'GET' });
  }

  private async request(path: string, init: RequestInit): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...(init.headers ?? {}),
      },
    });

    const text = await response.text();
    const payload = this.tryParseJson(text);

    if (!response.ok) {
      const details = typeof payload === 'string' ? payload : JSON.stringify(payload ?? text);
      throw new Error(`Whapi request failed (${response.status} ${response.statusText}) on ${path}: ${details}`);
    }

    return payload;
  }

  private tryParseJson(raw: string): unknown {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
}
