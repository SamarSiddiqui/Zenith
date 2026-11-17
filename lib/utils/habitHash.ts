/**
 * Computes a fast, deterministic 32-bit FNV-1a hash string from habits array,
 * current sprint day, and working window for content-addressed diagnosis caching.
 * Safe for both browser clients and server routes.
 */
export function hashHabitsState(
  habits: Array<{
    id?: string;
    name?: string;
    week?: string[];
    circadianSlot?: string;
    minutes?: number;
    microVersion?: string;
  }>,
  sprintDay: number = 0,
  workingWindow?: { startTime?: string; endTime?: string }
): string {
  try {
    const signature = habits
      .map((h) => {
        const id = h.id || '';
        const name = h.name || '';
        const weekStr = (h.week || []).join('');
        const slot = h.circadianSlot || '';
        const minutes = h.minutes || 0;
        const micro = h.microVersion || '';
        return `${id}:${name}:${weekStr}:${slot}:${minutes}:${micro}`;
      })
      .sort()
      .join('|');

    const fullSignature = `${signature}#day:${sprintDay}#win:${workingWindow?.startTime || ''}-${workingWindow?.endTime || ''}`;

    let hash = 2166136261;
    for (let i = 0; i < fullSignature.length; i++) {
      hash ^= fullSignature.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  } catch {
    return String(Date.now());
  }
}

