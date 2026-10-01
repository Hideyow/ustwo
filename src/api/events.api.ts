import { supabase, isSupabaseConfigured, getSignedPhotoUrl } from '@/lib/supabase';
import { mockAdapter } from './mock-adapter';
import type { CalendarEvent, CreateEventInput, UpdateEventInput, Photo, Category, Mood, Task } from '@/types/schemas';

const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !isSupabaseConfigured;

interface DbEventRow {
  id: string;
  title: string;
  date: string;
  end_date: string | null;
  time: string | null;
  category: string;
  mood: string;
  description: string | null;
  tasks: unknown;
  favorite: boolean;
  confirmed_by: string[] | null;
  created_by: string | null;
  created_at: string;
  event_photos?: Array<{
    id: string;
    storage_path: string;
    added_by: string | null;
    created_at: string;
  }>;
}

async function mapRowToEvent(row: DbEventRow): Promise<CalendarEvent> {
  const photoPromises = (row.event_photos || []).map(async (p): Promise<Photo> => {
    const url = await getSignedPhotoUrl(p.storage_path);
    return {
      url,
      addedBy: p.added_by || 'partner',
    };
  });

  const photos = await Promise.all(photoPromises);

  return {
    id: row.id,
    title: row.title,
    date: row.date,
    endDate: row.end_date || undefined,
    time: row.time ? row.time.slice(0, 5) : undefined,
    category: (row.category || 'milestone') as Category,
    mood: (row.mood || 'romantic') as Mood,
    description: row.description || '',
    tasks: (Array.isArray(row.tasks) ? row.tasks : []) as Task[],
    photos,
    favorite: Boolean(row.favorite),
    confirmedBy: Array.isArray(row.confirmed_by) ? row.confirmed_by : [],
  };
}

export const eventsApi = {
  async getEvents(month?: string): Promise<CalendarEvent[]> {
    if (useMock) {
      return mockAdapter.getEvents(month);
    }

    let query = supabase
      .from('events')
      .select('*, event_photos(*)')
      .order('date', { ascending: true });

    if (month) {
      query = query
        .gte('date', `${month}-01`)
        .lte('date', `${month}-31`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to fetch events from Supabase:', error);
      throw new Error(error.message);
    }

    const rows = (data || []) as DbEventRow[];
    return Promise.all(rows.map(mapRowToEvent));
  },

  async createEvent(input: CreateEventInput): Promise<CalendarEvent> {
    if (useMock) {
      return mockAdapter.createEvent(input);
    }

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id || null;

    const insertPayload = {
      title: input.title,
      date: input.date,
      end_date: input.endDate || null,
      time: input.time || null,
      category: input.category,
      mood: input.mood,
      description: input.description || '',
      tasks: input.tasks || [],
      favorite: Boolean(input.favorite),
      confirmed_by: input.confirmedBy || [],
      created_by: userId,
    };

    const { data: newEvent, error: insertError } = await supabase
      .from('events')
      .insert(insertPayload)
      .select('*, event_photos(*)')
      .single();

    if (insertError || !newEvent) {
      console.error('Failed to create event in Supabase:', insertError);
      throw new Error(insertError?.message || 'Could not create event');
    }

    // Insert photos if provided
    if (input.photos && input.photos.length > 0) {
      const photoPayload = input.photos.map((p) => ({
        event_id: newEvent.id,
        storage_path: p.url,
        added_by: userId,
      }));

      const { error: photoError } = await supabase
        .from('event_photos')
        .insert(photoPayload);

      if (photoError) {
        console.warn('Failed to insert photos for event:', photoError);
      }
    }

    // Return freshly fetched event with photos
    const { data: refreshedEvent, error: refreshError } = await supabase
      .from('events')
      .select('*, event_photos(*)')
      .eq('id', newEvent.id)
      .single();

    if (refreshError || !refreshedEvent) {
      return mapRowToEvent(newEvent as DbEventRow);
    }

    return mapRowToEvent(refreshedEvent as DbEventRow);
  },

  async updateEvent(input: UpdateEventInput): Promise<CalendarEvent> {
    if (useMock) {
      return mockAdapter.updateEvent(input);
    }

    const updatePayload: Record<string, unknown> = {};
    if (input.title !== undefined) updatePayload.title = input.title;
    if (input.date !== undefined) updatePayload.date = input.date;
    if (input.endDate !== undefined) updatePayload.end_date = input.endDate || null;
    if (input.time !== undefined) updatePayload.time = input.time || null;
    if (input.category !== undefined) updatePayload.category = input.category;
    if (input.mood !== undefined) updatePayload.mood = input.mood;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (input.tasks !== undefined) updatePayload.tasks = input.tasks;
    if (input.favorite !== undefined) updatePayload.favorite = input.favorite;
    if (input.confirmedBy !== undefined) updatePayload.confirmed_by = input.confirmedBy;

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabase
        .from('events')
        .update(updatePayload)
        .eq('id', input.id);

      if (updateError) {
        console.error('Failed to update event in Supabase:', updateError);
        throw new Error(updateError.message);
      }
    }

    // Handle photo updates if photos were passed
    if (input.photos !== undefined) {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id || null;

      // Delete existing photos and insert updated list
      await supabase.from('event_photos').delete().eq('event_id', input.id);

      if (input.photos.length > 0) {
        const photoPayload = input.photos.map((p) => ({
          event_id: input.id,
          storage_path: p.url,
          added_by: userId,
        }));
        await supabase.from('event_photos').insert(photoPayload);
      }
    }

    const { data: updatedEvent, error: fetchError } = await supabase
      .from('events')
      .select('*, event_photos(*)')
      .eq('id', input.id)
      .single();

    if (fetchError || !updatedEvent) {
      throw new Error(fetchError?.message || 'Failed to fetch updated event');
    }

    return mapRowToEvent(updatedEvent as DbEventRow);
  },

  async deleteEvent(id: string): Promise<void> {
    if (useMock) {
      return mockAdapter.deleteEvent(id);
    }

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete event from Supabase:', error);
      throw new Error(error.message);
    }
  },
};
