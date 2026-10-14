/**
 * Safe RFC4122 v4 UUID generator that works in both secure contexts (HTTPS, localhost)
 * and insecure contexts (HTTP over LAN IP e.g. http://192.168.x.x:3000 on mobile devices),
 * where `crypto.randomUUID` is undefined in modern browsers.
 */
export function safeRandomUUID(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      try {
        return crypto.randomUUID();
      } catch {}
    }
    if (typeof crypto.getRandomValues === 'function') {
      try {
        return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
          (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
        );
      } catch {}
    }
  }

  // Math.random RFC4122 v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Polyfill window.crypto.randomUUID if missing (insecure context)
if (typeof window !== 'undefined') {
  try {
    if (!window.crypto) {
      (window as any).crypto = {};
    }
    if (typeof window.crypto.randomUUID !== 'function') {
      window.crypto.randomUUID = safeRandomUUID as any;
    }
  } catch {}
}

