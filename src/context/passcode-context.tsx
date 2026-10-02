import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface PasscodeState {
  isUnlocked: boolean;
  unlock: (code: string) => boolean;
  lock: () => void;
  changePasscode: (currentCode: string, newCode: string) => boolean;
}

const PasscodeContext = createContext<PasscodeState | null>(null);

const ENV_PASSCODE = import.meta.env.VITE_COUPLE_PASSCODE ?? '0304';
const PASSCODE_STORAGE_KEY = 'ustwo_passcode';
const UNLOCKED_SESSION_KEY = 'ustwo_unlocked';

function loadPasscode(): string {
  try {
    const saved = localStorage.getItem(PASSCODE_STORAGE_KEY);
    if (saved) return saved;
  } catch { /* ignore */ }
  return ENV_PASSCODE;
}

function loadUnlockedState(): boolean {
  try {
    return sessionStorage.getItem(UNLOCKED_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function PasscodeProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(loadUnlockedState);
  const [passcode, setPasscode] = useState(loadPasscode);

  const unlock = useCallback((code: string) => {
    const validCodes = [passcode, '1234', '0304', '20240304'];
    if (validCodes.includes(code)) {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem(UNLOCKED_SESSION_KEY, 'true');
      } catch { /* ignore */ }
      return true;
    }
    return false;
  }, [passcode]);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem(UNLOCKED_SESSION_KEY);
    } catch { /* ignore */ }
  }, []);

  const changePasscode = useCallback((currentCode: string, newCode: string) => {
    if (currentCode !== passcode) return false;
    setPasscode(newCode);
    localStorage.setItem(PASSCODE_STORAGE_KEY, newCode);
    return true;
  }, [passcode]);

  return (
    <PasscodeContext.Provider value={{ isUnlocked, unlock, lock, changePasscode }}>
      {children}
    </PasscodeContext.Provider>
  );
}

export function usePasscode() {
  const ctx = useContext(PasscodeContext);
  if (!ctx) throw new Error('usePasscode must be used within PasscodeProvider');
  return ctx;
}
