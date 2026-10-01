import { z } from 'zod/v4';

export const CategoryEnum = z.enum([
  'date_night',
  'trip',
  'anniversary',
  'little_moment',
  'surprise',
  'milestone',
]);

export const MoodEnum = z.enum(['romantic', 'chill', 'fancy', 'adventure']);

export const TaskSchema = z.object({
  assignee: z.enum(['lawrence', 'marga']).or(z.string()),
  text: z.string(),
});

export const PhotoSchema = z.object({
  url: z.string(),
  addedBy: z.string(),
});

export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  endDate: z.string().optional(),
  time: z.string().optional(),
  category: CategoryEnum,
  mood: MoodEnum,
  description: z.string().optional().default(''),
  tasks: z.array(TaskSchema).optional().default([]),
  photos: z.array(PhotoSchema).optional().default([]),
  favorite: z.boolean().optional().default(false),
  confirmedBy: z.array(z.string()).optional().default([]),
});

export type Category = z.infer<typeof CategoryEnum>;
export type Mood = z.infer<typeof MoodEnum>;
export type Task = z.infer<typeof TaskSchema>;
export type Photo = z.infer<typeof PhotoSchema>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const CreateEventSchema = CalendarEventSchema.omit({ id: true });
export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const UpdateEventSchema = CalendarEventSchema.partial().required({ id: true });
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;

/* ─── Form Schema (for React Hook Form) ─── */
export const EventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string(),
  category: CategoryEnum,
  mood: MoodEnum,
  description: z.string(),
});

export type EventFormValues = z.infer<typeof EventFormSchema>;

/* ─── Category Display Info ─── */
export const CATEGORY_INFO: Record<Category, { label: string; emoji: string; color: string }> = {
  milestone: { label: 'Milestones', emoji: '💎', color: 'var(--color-cat-milestone)' },
  date_night: { label: 'Date Nights', emoji: '🍷', color: 'var(--color-cat-date-night)' },
  trip: { label: 'Trips & Getaways', emoji: '✈️', color: 'var(--color-cat-trip)' },
  anniversary: { label: 'Anniversaries', emoji: '💍', color: 'var(--color-cat-anniversary)' },
  little_moment: { label: 'Little Moments', emoji: '☕', color: 'var(--color-cat-little-moment)' },
  surprise: { label: 'Special Surprises', emoji: '🎁', color: 'var(--color-cat-surprise)' },
};

export const MOOD_INFO: Record<Mood, { label: string; emoji: string }> = {
  romantic: { label: 'Romantic', emoji: '🍰' },
  chill: { label: 'Chill & Cozy', emoji: '☕' },
  fancy: { label: 'Fancy Glam', emoji: '🥂' },
  adventure: { label: 'Adventure', emoji: '🏔' },
};
