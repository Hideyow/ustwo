import type { CalendarEvent, CreateEventInput, UpdateEventInput } from '@/types/schemas';

const STORAGE_KEY = 'ustwo_calendar_events';

function loadStoredEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save calendar events', e);
  }
}

let store: CalendarEvent[] = loadStoredEvents();

function delay(ms = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAdapter = {
  async getEvents(_month?: string): Promise<CalendarEvent[]> {
    await delay();
    return [...store];
  },

  async createEvent(input: CreateEventInput): Promise<CalendarEvent> {
    await delay();
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
    const idx = store.findIndex((e) => e.id === input.id);
    if (idx === -1) throw new Error('Event not found');
    store[idx] = { ...store[idx], ...input } as CalendarEvent;
    saveStoredEvents(store);
    return store[idx];
  },

  async deleteEvent(id: string): Promise<void> {
    await delay();
    store = store.filter((e) => e.id !== id);
    saveStoredEvents(store);
  },
};
