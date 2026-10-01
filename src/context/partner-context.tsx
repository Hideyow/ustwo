import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface Partner {
  name: string;
  initial: string;
  color: string;
  avatar?: string; // URL or data-uri for profile picture
}

interface PartnerState {
  partner1: Partner;
  partner2: Partner;
  activePartner: 'partner1' | 'partner2';
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

function savePartners(p1: Partner, p2: Partner) {
  localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify({ p1, p2 }));
}

export function PartnerProvider({ children }: { children: ReactNode }) {
  const [activePartner, setActivePartner] = useState<'partner1' | 'partner2'>('partner1');
  const [partners, setPartners] = useState(() => loadPartners());
  const [anniversaryDate, setAnniversaryDateState] = useState<string>(() => {
    const saved = localStorage.getItem(ANNIVERSARY_KEY);
    if (!saved || saved === '2023-10-01') {
      localStorage.setItem(ANNIVERSARY_KEY, DEFAULT_ANNIVERSARY);
      return DEFAULT_ANNIVERSARY;
    }
    return saved;
  });

  const setAnniversaryDate = useCallback((dateStr: string) => {
    localStorage.setItem(ANNIVERSARY_KEY, dateStr);
    setAnniversaryDateState(dateStr);
  }, []);

  const switchPartner = useCallback(() => {
    setActivePartner((p) => (p === 'partner1' ? 'partner2' : 'partner1'));
  }, []);

  const updatePartner = useCallback((which: 'partner1' | 'partner2', updates: Partial<Partner>) => {
    setPartners((prev) => {
      const key = which === 'partner1' ? 'p1' : 'p2';
      const updated = { ...prev[key], ...updates };
      // Auto-update initial if name changes
      if (updates.name && !updates.initial) {
        updated.initial = updates.name.charAt(0).toUpperCase();
      }
      const next = { ...prev, [key]: updated };
      savePartners(next.p1, next.p2);
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

  const coupleLabel = `${partners.p1.name} ♥ ${partners.p2.name}`;

  return (
    <PartnerContext.Provider
      value={{
        partner1: partners.p1,
        partner2: partners.p2,
        activePartner,
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
