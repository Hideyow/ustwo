import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api/events.api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { CreateEventInput, UpdateEventInput } from '@/types/schemas';
import { toast } from 'sonner';

const EVENTS_KEY = ['events'] as const;

/**
 * Subscribes to Supabase Realtime changes on public.events and public.event_photos.
 * Automatically invalidates TanStack Query cache whenever a partner creates, updates, or deletes an event.
 */
export function useEventsRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured || import.meta.env.VITE_USE_MOCK === 'true') {
      return;
    }

    const channel = supabase
      .channel('realtime:events-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          qc.invalidateQueries({ queryKey: EVENTS_KEY });
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_photos' },
        () => {
          qc.invalidateQueries({ queryKey: EVENTS_KEY });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}

export function useEvents(month?: string) {
  useEventsRealtime();

  return useQuery({
    queryKey: [...EVENTS_KEY, month],
    queryFn: () => eventsApi.getEvents(month),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) => eventsApi.createEvent(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EVENTS_KEY });
      toast.success('Date saved! 💜', { description: 'Your special moment has been added to the calendar.' });
    },
    onError: () => {
      toast.error('Oops!', { description: 'Could not save the date. Please try again.' });
    },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateEventInput) => eventsApi.updateEvent(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EVENTS_KEY });
      toast.success('Updated! ✨', { description: 'Your plans have been refreshed.' });
    },
    onError: () => {
      toast.error('Oops!', { description: 'Could not update. Please try again.' });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EVENTS_KEY });
      toast.success('Removed 🗑', { description: 'The event has been removed from your calendar.' });
    },
    onError: () => {
      toast.error('Oops!', { description: 'Could not delete. Please try again.' });
    },
  });
}
