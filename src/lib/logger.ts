const isDev = import.meta.env.DEV;

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.info('[UsTwo]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn('[UsTwo]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[UsTwo]', ...args);
  },
};
