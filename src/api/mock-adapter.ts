import type { CalendarEvent, CreateEventInput, UpdateEventInput } from '@/types/schemas';

export const MOCK_EVENTS_STORAGE_KEY = 'ustwo_calendar_events';

function loadStoredEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(MOCK_EVENTS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as CalendarEvent[];
    }
  } catch (e) {
    console.error('Failed to parse saved calendar events', e);
  }
  return [];
}

function saveStoredEvents(events: CalendarEvent[]) {
  try {
    localStorage.setItem(MOCK_EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save calendar events', e);
  }
}

function delay(ms = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAdapter = {
  async getEvents(_month?: string): Promise<CalendarEvent[]> {
    await delay();
    // Always re-read from localStorage so cross-tab changes are picked up
    return [...loadStoredEvents()];
  },

  async createEvent(input: CreateEventInput): Promise<CalendarEvent> {
    await delay();
    const store = loadStoredEvents();
    const newEvent: CalendarEvent = {
      ...input,
      id: String(Date.now()),
      tasks: input.tasks ?? [],
      photos: input.photos ?? [],
      favorite: input.favorite ?? false,
      confirmedBy: input.confirmedBy ?? ['lawrence', 'marga'],
      description: input.description ?? '',
    };
    store.push(newEvent);
    saveStoredEvents(store);
    return newEvent;
  },

  async updateEvent(input: UpdateEventInput): Promise<CalendarEvent> {
    await delay();
    const store = loadStoredEvents();
    const idx = store.findIndex((e) => e.id === input.id);
    if (idx === -1) throw new Error('Event not found');
    store[idx] = { ...store[idx], ...input } as CalendarEvent;
    saveStoredEvents(store);
    return store[idx];
  },

  async deleteEvent(id: string): Promise<void> {
    await delay();
    const store = loadStoredEvents().filter((e) => e.id !== id);
    saveStoredEvents(store);
  },
};
