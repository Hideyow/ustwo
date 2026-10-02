import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Partner {
  name: string;
  initial: string;
  color: string;
  avatar?: string; // URL or data-uri for profile picture
}

interface PartnerState {
  partner1: Partner;
  partner2: Partner;
  activePartner: 'partner1' | 'partner2';
  currentPartner: Partner;
  otherPartner: Partner;
  setActivePartner: (partner: 'partner1' | 'partner2') => void;
  switchPartner: () => void;
  coupleLabel: string;
  daysTogether: number;
  anniversaryDate: string;
  setAnniversaryDate: (dateStr: string) => Promise<void>;
  updatePartner: (which: 'partner1' | 'partner2', updates: Partial<Partner>) => Promise<void>;
}

interface SettingsRow {
  id: string;
  p1_name: string | null;
  p1_avatar: string | null;
  p2_name: string | null;
  p2_avatar: string | null;
  anniversary_date: string | null;
}

const PartnerContext = createContext<PartnerState | null>(null);

const DEFAULT_P1: Partner = { name: 'Lawrence', initial: 'L', color: '#7c3aed' };
const DEFAULT_P2: Partner = { name: 'Marga', initial: 'M', color: '#ec4899' };

const SETTINGS_ID = 'main';
const PARTNER_STORAGE_KEY = 'ustwo_partners'; // local cache only
const ANNIVERSARY_KEY = 'ustwo_anniversary_date'; // local cache only
const ACTIVE_PARTNER_SESSION_KEY = 'ustwo_active_partner_session';
const ACTIVE_PARTNER_LOCAL_KEY = 'ustwo_active_partner';
const DEFAULT_ANNIVERSARY = '2024-03-04'; // March 4, 2024

type Partners = { p1: Partner; p2: Partner };

const initialOf = (name: string) => name.trim().charAt(0).toUpperCase();

function loadPartners(): Partners {
  try {
    const raw = localStorage.getItem(PARTNER_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        p1: { ...DEFAULT_P1, ...data.p1 },
        p2: { ...DEFAULT_P2, ...data.p2 },
      };
    }
  } catch { /* ignore */ }
  return { p1: DEFAULT_P1, p2: DEFAULT_P2 };
}

function loadActivePartner(): 'partner1' | 'partner2' {
  try {
    // Check tab-specific sessionStorage first
    const sessionVal = sessionStorage.getItem(ACTIVE_PARTNER_SESSION_KEY);
    if (sessionVal === 'partner1' || sessionVal === 'partner2') return sessionVal;

    // Fallback to localStorage
    const localVal = localStorage.getItem(ACTIVE_PARTNER_LOCAL_KEY);
    if (localVal === 'partner1' || localVal === 'partner2') return localVal;
  } catch { /* ignore */ }
  return 'partner1';
}

function savePartnersCache(p1: Partner, p2: Partner) {
  try {
    localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify({ p1, p2 }));
  } catch { /* ignore (e.g. storage full) */ }
}

async function saveSettings(payload: Record<string, string | null>) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('couple_settings')
    .upsert({ id: SETTINGS_ID, ...payload, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export function PartnerProvider({ children }: { children: ReactNode }) {
  const [activePartner, setActivePartnerState] = useState<'partner1' | 'partner2'>(() => loadActivePartner());
  const [partners, setPartners] = useState<Partners>(() => loadPartners());
  const partnersRef = useRef<Partners>(partners);
  const realtimeOk = useRef(false);

  const [anniversaryDate, setAnniversaryDateState] = useState<string>(() => {
    const saved = localStorage.getItem(ANNIVERSARY_KEY);
    if (!saved || saved === '2023-10-01') {
      localStorage.setItem(ANNIVERSARY_KEY, DEFAULT_ANNIVERSARY);
      return DEFAULT_ANNIVERSARY;
    }
    return saved;
  });

  // Apply a row from Supabase (the shared source of truth) to local state
  const applyRow = useCallback((row: SettingsRow) => {
    const n1 = row.p1_name || DEFAULT_P1.name;
    const n2 = row.p2_name || DEFAULT_P2.name;
    const next: Partners = {
      p1: { ...DEFAULT_P1, name: n1, initial: initialOf(n1), avatar: row.p1_avatar || undefined },
      p2: { ...DEFAULT_P2, name: n2, initial: initialOf(n2), avatar: row.p2_avatar || undefined },
    };
    partnersRef.current = next;
    setPartners(next);
    savePartnersCache(next.p1, next.p2);

    if (row.anniversary_date) {
      setAnniversaryDateState(row.anniversary_date);
      try {
        localStorage.setItem(ANNIVERSARY_KEY, row.anniversary_date);
      } catch { /* ignore */ }
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('couple_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();
    if (error || !data) return;
    applyRow(data as SettingsRow);
  }, [applyRow]);

  // Load from Supabase + realtime subscription so both partners stay in sync
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    fetchSettings();

    const channel = supabase
      .channel('couple-settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'couple_settings' }, () => {
        // Refetch instead of trusting the payload (large avatar values can be omitted from it)
        fetchSettings();
      })
      .subscribe((status) => {
        realtimeOk.current = status === 'SUBSCRIBED';
        console.log('[settings realtime]', status);
      });

    // Fallback polling only when realtime isn't connected (avatars are large)
    const interval = window.setInterval(() => {
      if (!realtimeOk.current) fetchSettings();
    }, 15000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchSettings();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  // Cross-tab sync for local-only mode (when Supabase isn't configured)
  useEffect(() => {
    if (isSupabaseConfigured) return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PARTNER_STORAGE_KEY) {
        const loaded = loadPartners();
        partnersRef.current = loaded;
        setPartners(loaded);
      }
      if (e.key === ANNIVERSARY_KEY && e.newValue) {
        setAnniversaryDateState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setAnniversaryDate = useCallback(async (dateStr: string) => {
    try {
      localStorage.setItem(ANNIVERSARY_KEY, dateStr);
    } catch { /* ignore */ }
    setAnniversaryDateState(dateStr);
    await saveSettings({ anniversary_date: dateStr });
  }, []);

  const setActivePartner = useCallback((partner: 'partner1' | 'partner2') => {
    setActivePartnerState(partner);
    try {
      sessionStorage.setItem(ACTIVE_PARTNER_SESSION_KEY, partner);
      localStorage.setItem(ACTIVE_PARTNER_LOCAL_KEY, partner);
    } catch { /* ignore */ }
  }, []);

  const switchPartner = useCallback(() => {
    setActivePartnerState((prev) => {
      const next = prev === 'partner1' ? 'partner2' : 'partner1';
      try {
        sessionStorage.setItem(ACTIVE_PARTNER_SESSION_KEY, next);
        localStorage.setItem(ACTIVE_PARTNER_LOCAL_KEY, next);
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const updatePartner = useCallback(
    async (which: 'partner1' | 'partner2', updates: Partial<Partner>) => {
      const key = which === 'partner1' ? 'p1' : 'p2';
      const prev = partnersRef.current;
      const oldName = prev[key].name;

      const updated: Partner = { ...prev[key], ...updates };
      if (updates.name !== undefined) {
        updated.name = updates.name.trim();
        if (!updates.initial) updated.initial = initialOf(updated.name);
      }
      const next: Partners = { ...prev, [key]: updated };

      // 1. Update local state immediately (instant UI) + local cache
      partnersRef.current = next;
      setPartners(next);
      savePartnersCache(next.p1, next.p2);

      // 2. Save to Supabase so the other partner receives it in realtime
      const payload: Record<string, string | null> = {};
      if (updates.name !== undefined) payload[`${key}_name`] = updated.name;
      if (updates.avatar !== undefined) payload[`${key}_avatar`] = updates.avatar || null;
      if (Object.keys(payload).length > 0) {
        await saveSettings(payload);
      }

      // 3. If the name changed, cascade the rename across stored data
      const newName = updated.name;
      if (updates.name !== undefined && newName && newName !== oldName.trim()) {
        // Local cached calendar events (mock mode / offline cache)
        try {
          const rawEvents = localStorage.getItem('ustwo_calendar_events');
          if (rawEvents) {
            const events = JSON.parse(rawEvents);
            let changed = false;
            for (const ev of events) {
              if (ev.createdBy && ev.createdBy.toLowerCase() === oldName.toLowerCase()) {
                ev.createdBy = newName;
                changed = true;
              }
              if (Array.isArray(ev.confirmedBy)) {
                ev.confirmedBy = ev.confirmedBy.map((n: string) =>
                  n.toLowerCase() === oldName.toLowerCase() ? newName : n,
                );
                changed = true;
              }
              if (Array.isArray(ev.photos)) {
                for (const ph of ev.photos) {
                  if (ph.addedBy && ph.addedBy.toLowerCase() === oldName.toLowerCase()) {
                    ph.addedBy = newName;
                    changed = true;
                  }
                }
              }
            }
            if (changed) {
              localStorage.setItem('ustwo_calendar_events', JSON.stringify(events));
              if (typeof BroadcastChannel !== 'undefined') {
                const bc = new BroadcastChannel('ustwo_events_sync');
                bc.postMessage({ type: 'EVENTS_UPDATED', timestamp: Date.now() });
                bc.close();
              }
            }
          }
        } catch (e) {
          console.error('Failed to cascade rename to local events:', e);
        }

        // Supabase: events, event_photos, ideas
        if (isSupabaseConfigured) {
          try {
            await supabase.from('events').update({ created_by: newName }).ilike('created_by', oldName);

            const { data: eventsWithConfirmed } = await supabase
              .from('events')
              .select('id, confirmed_by');

            if (eventsWithConfirmed) {
              for (const ev of eventsWithConfirmed) {
                if (
                  Array.isArray(ev.confirmed_by) &&
                  ev.confirmed_by.some((n: string) => n.toLowerCase() === oldName.toLowerCase())
                ) {
                  const updatedConfirmed = ev.confirmed_by.map((n: string) =>
                    n.toLowerCase() === oldName.toLowerCase() ? newName : n,
                  );
                  await supabase.from('events').update({ confirmed_by: updatedConfirmed }).eq('id', ev.id);
                }
              }
            }

            await supabase.from('event_photos').update({ added_by: newName }).ilike('added_by', oldName);
            await supabase.from('ideas').update({ proposed_by: newName }).ilike('proposed_by', oldName);
          } catch (err) {
            console.error('Failed to cascade rename to Supabase:', err);
          }
        }
      }
    },
    [],
  );

  const daysTogether = (() => {
    const ann = new Date(anniversaryDate + 'T00:00:00');
    const now = new Date();
    const diff = now.getTime() - ann.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  })();

  const currentPartner = activePartner === 'partner1' ? partners.p1 : partners.p2;
  const otherPartner = activePartner === 'partner1' ? partners.p2 : partners.p1;
  const coupleLabel = `${partners.p1.name} ♥ ${partners.p2.name}`;

  return (
    <PartnerContext.Provider
      value={{
        partner1: partners.p1,
        partner2: partners.p2,
        activePartner,
        currentPartner,
        otherPartner,
        setActivePartner,
        switchPartner,
        coupleLabel,
        daysTogether,
        anniversaryDate,
        setAnniversaryDate,
        updatePartner,
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner() {
  const ctx = useContext(PartnerContext);
  if (!ctx) throw new Error('usePartner must be used within PartnerProvider');
  return ctx;
}