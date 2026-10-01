import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('http') &&
  !rawUrl.includes('your-project-id')
);

// Fallback placeholder credentials so createClient does not throw on app boot
// when offline or when using the mock adapter
const supabaseUrl = isSupabaseConfigured ? rawUrl! : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawKey! : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Storage bucket name for private photos
 */
export const STORAGE_BUCKET_MEMORIES = 'memories';

/**
 * Returns a signed URL for a photo in the private memories bucket.
 * If the path is already an external URL or base64 data URI, returns it directly.
 */
export async function getSignedPhotoUrl(storagePath: string, expiresIn = 3600): Promise<string> {
  if (!storagePath) return '';
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://') || storagePath.startsWith('data:')) {
    return storagePath;
  }
  if (!isSupabaseConfigured) {
    return storagePath;
  }

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET_MEMORIES)
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data?.signedUrl) {
      console.warn('Failed to generate signed URL for photo:', storagePath, error);
      return storagePath;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return storagePath;
  }
}

/**
 * Uploads a photo file to the private memories bucket.
 * Enforces file type (image/*) and size (< 10MB).
 * Returns the stored path.
 */
export async function uploadEventPhoto(file: File, eventId?: string): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new Error('Photo must be less than 10MB');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const prefix = eventId ? `events/${eventId}` : 'events/general';
  const filePath = `${prefix}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET_MEMORIES)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error || !data?.path) {
    throw new Error(error?.message || 'Failed to upload photo to Supabase storage');
  }

  return data.path;
}
