import { getSquareClient, getSquareLocationId, isSquareConfigured } from './square';
import { PICKUP_WINDOWS as FALLBACK_WINDOWS, type PickupDay } from './pickup';

export interface PickupWindowInfo {
  display: string;
  // "HH:MM" in the location's local time, from Square's business hours — null
  // when Square isn't configured or has no hours set for that day.
  startLocalTime: string | null;
}

type PickupWindows = Record<PickupDay, PickupWindowInfo>;

const DAY_CODE: Record<PickupDay, string> = { friday: 'FRI', saturday: 'SAT' };
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { windows: PickupWindows; expiresAt: number } | null = null;

function formatLocalTime(hhmmss: string): string {
  const [h, m] = hhmmss.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function fallbackWindows(): PickupWindows {
  return {
    friday: { display: FALLBACK_WINDOWS.friday, startLocalTime: null },
    saturday: { display: FALLBACK_WINDOWS.saturday, startLocalTime: null },
  };
}

// Reads Friday/Saturday pickup windows straight from the Square location's
// own business hours, so staff only ever have to update hours in one place
// (their Square account) rather than in this codebase.
export async function getPickupWindows(): Promise<PickupWindows> {
  if (cache && cache.expiresAt > Date.now()) return cache.windows;
  if (!isSquareConfigured()) return fallbackWindows();

  try {
    const client = getSquareClient();
    const locationId = getSquareLocationId();
    const { location } = await client.locations.get({ locationId });
    const periods = location?.businessHours?.periods ?? [];

    const windows = fallbackWindows();
    (Object.keys(DAY_CODE) as PickupDay[]).forEach((day) => {
      const period = periods.find((p) => p.dayOfWeek === DAY_CODE[day]);
      if (period?.startLocalTime && period?.endLocalTime) {
        windows[day] = {
          display: `${formatLocalTime(period.startLocalTime)} - ${formatLocalTime(period.endLocalTime)}`,
          startLocalTime: period.startLocalTime,
        };
      }
    });

    cache = { windows, expiresAt: Date.now() + CACHE_TTL_MS };
    return windows;
  } catch (err) {
    console.error('Failed to fetch Square business hours; using fallback pickup windows', err);
    return fallbackWindows();
  }
}
