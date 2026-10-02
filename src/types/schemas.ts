import { z } from 'zod/v4';

export const CategoryEnum = z.enum([
  'anniversary',
  'motmot',
  'random_date',
  'gala',
  'others',
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
  createdBy: z.string().optional(),
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
// Colors are plain hex values (same as the calendar filter dots and legend),
// so they don't depend on CSS variables in index.css.
export const CATEGORY_INFO: Record<Category, { label: string; emoji: string; color: string }> = {
  anniversary: { label: 'Anniv', emoji: '💍', color: '#6d28d9' },
  motmot: { label: 'Motmot', emoji: '💕', color: '#ec4899' },
  random_date: { label: 'Random Date', emoji: '🍷', color: '#8b5cf6' },
  gala: { label: 'Gala', emoji: '✨', color: '#f59e0b' },
  others: { label: 'Others', emoji: '☕', color: '#64748b' },
};

export const MOOD_INFO: Record<Mood, { label: string; emoji: string }> = {
  romantic: { label: 'Romantic', emoji: '🍰' },
  chill: { label: 'Chill & Cozy', emoji: '☕' },
  fancy: { label: 'Fancy Glam', emoji: '🥂' },
  adventure: { label: 'Adventure', emoji: '🏔' },
};