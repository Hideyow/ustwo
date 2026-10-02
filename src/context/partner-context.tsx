import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

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
  setAnniversaryDate: (dateStr: string) => void;
  updatePartner: (which: 'partner1' | 'partner2', updates: Partial<Partner>) => void;
}

const PartnerContext = createContext<PartnerState | null>(null);

const DEFAULT_P1: Partner = { name: 'Lawrence', initial: 'L', color: '#7c3aed' };
const DEFAULT_P2: Partner = { name: 'Marga', initial: 'M', color: '#ec4899' };

const PARTNER_STORAGE_KEY = 'ustwo_partners';
const ANNIVERSARY_KEY = 'ustwo_anniversary_date';
const ACTIVE_PARTNER_SESSION_KEY = 'ustwo_active_partner_session';
const ACTIVE_PARTNER_LOCAL_KEY = 'ustwo_active_partner';
const DEFAULT_ANNIVERSARY = '2024-03-04'; // March 4, 2024

function loadPartners(): { p1: Partner; p2: Partner } {
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

function savePartners(p1: Partner, p2: Partner) {
  localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify({ p1, p2 }));
}

export function PartnerProvider({ children }: { children: ReactNode }) {
  const [activePartner, setActivePartnerState] = useState<'partner1' | 'partner2'>(() => loadActivePartner());
  const [partners, setPartners] = useState(() => loadPartners());
  const [anniversaryDate, setAnniversaryDateState] = useState<string>(() => {
    const saved = localStorage.getItem(ANNIVERSARY_KEY);
    if (!saved || saved === '2023-10-01') {
      localStorage.setItem(ANNIVERSARY_KEY, DEFAULT_ANNIVERSARY);
      return DEFAULT_ANNIVERSARY;
    }
    return saved;
  });

  // Cross-tab sync: re-read partner profile info and anniversary when another tab writes to localStorage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PARTNER_STORAGE_KEY) {
        setPartners(loadPartners());
      }
      if (e.key === ANNIVERSARY_KEY && e.newValue) {
        setAnniversaryDateState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setAnniversaryDate = useCallback((dateStr: string) => {
    localStorage.setItem(ANNIVERSARY_KEY, dateStr);
    setAnniversaryDateState(dateStr);
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

  const updatePartner = useCallback((which: 'partner1' | 'partner2', updates: Partial<Partner>) => {
    setPartners((prev) => {
      const key = which === 'partner1' ? 'p1' : 'p2';
      const oldName = prev[key].name;
      const updated = { ...prev[key], ...updates };
      // Auto-update initial if name changes
      if (updates.name && !updates.initial) {
        updated.initial = updates.name.charAt(0).toUpperCase();
      }
      const next = { ...prev, [key]: updated };
      savePartners(next.p1, next.p2);

      // If name actually changed, cascade the rename across all stored data
      if (updates.name && updates.name.trim() !== oldName.trim()) {
        const newName = updates.name.trim();

        // 1. Update localStorage calendar events (mock/cached events)
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
                  n.toLowerCase() === oldName.toLowerCase() ? newName : n
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

        // 2. Update localStorage wishlist date ideas
        try {
          const rawIdeas = localStorage.getItem('ustwo_date_ideas');
          if (rawIdeas) {
            const ideas = JSON.parse(rawIdeas);
            let ideasChanged = false;
            for (const idea of ideas) {
              if (idea.proposedBy && idea.proposedBy.toLowerCase() === oldName.toLowerCase()) {
                idea.proposedBy = newName;
                ideasChanged = true;
              }
            }
            if (ideasChanged) {
              localStorage.setItem('ustwo_date_ideas', JSON.stringify(ideas));
              if (typeof BroadcastChannel !== 'undefined') {
                const bc = new BroadcastChannel('ustwo_ideas_channel');
                bc.postMessage({ type: 'IDEAS_UPDATED' });
                bc.close();
              }
            }
          }
        } catch (e) {
          console.error('Failed to cascade rename to local ideas:', e);
        }

        // 3. Update Supabase events and event_photos if connected
        try {
          import('@/lib/supabase').then(async ({ supabase, isSupabaseConfigured }) => {
            if (!isSupabaseConfigured) return;

            // Cascade update in events table: created_by
            await supabase
              .from('events')
              .update({ created_by: newName })
              .ilike('created_by', oldName);

            // Fetch events where confirmed_by contains old name and update them
            const { data: eventsWithConfirmed } = await supabase
              .from('events')
              .select('id, confirmed_by');

            if (eventsWithConfirmed) {
              for (const ev of eventsWithConfirmed) {
                if (Array.isArray(ev.confirmed_by) && ev.confirmed_by.some((n: string) => n.toLowerCase() === oldName.toLowerCase())) {
                  const updatedConfirmed = ev.confirmed_by.map((n: string) =>
                    n.toLowerCase() === oldName.toLowerCase() ? newName : n
                  );
                  await supabase
                    .from('events')
                    .update({ confirmed_by: updatedConfirmed })
                    .eq('id', ev.id);
                }
              }
            }

            // Cascade update in event_photos table: added_by
            await supabase
              .from('event_photos')
              .update({ added_by: newName })
              .ilike('added_by', oldName);
          }).catch((err) => console.error('Failed to cascade rename to Supabase:', err));
        } catch { /* ignore */ }
      }

      return next;
    });
  }, []);

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
