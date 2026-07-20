import { DateTime } from 'luxon';

export const TIME_ZONE = 'America/New_York';

// TODO(owner): Replace these placeholders with the real pickup windows before go-live.
export const PICKUP_WINDOWS = {
  friday: 'TBD — set real pickup hours (e.g. "4:00 PM - 6:00 PM")',
  saturday: 'TBD — set real pickup hours (e.g. "10:00 AM - 12:00 PM")',
} as const;

export type PickupDay = 'friday' | 'saturday';

export interface PickupDateOption {
  date: string; // YYYY-MM-DD
  day: PickupDay;
  label: string; // e.g. "Friday, July 24"
  window: string;
}

export interface PickupAvailability {
  friday: PickupDateOption;
  saturday: PickupDateOption;
  cutoffPassed: boolean;
  cutoffLabel: string;
}

// Order cutoff: every Wednesday 9:00 PM America/New_York. Before the cutoff,
// this week's Friday/Saturday are selectable. At/after the cutoff, the
// earliest selectable dates roll forward to next week's Friday/Saturday.
export function getAvailablePickupDates(referenceDate?: Date): PickupAvailability {
  const now = referenceDate ? DateTime.fromJSDate(referenceDate).setZone(TIME_ZONE) : DateTime.now().setZone(TIME_ZONE);

  const daysToFriday = (5 - now.weekday + 7) % 7;
  const upcomingFriday = now.startOf('day').plus({ days: daysToFriday });
  const cutoff = upcomingFriday.minus({ days: 2 }).set({ hour: 21, minute: 0, second: 0, millisecond: 0 });
  const cutoffPassed = now >= cutoff;

  const fridayDate = cutoffPassed ? upcomingFriday.plus({ days: 7 }) : upcomingFriday;
  const saturdayDate = fridayDate.plus({ days: 1 });

  return {
    friday: {
      date: fridayDate.toFormat('yyyy-MM-dd'),
      day: 'friday',
      label: fridayDate.toFormat('cccc, LLLL d'),
      window: PICKUP_WINDOWS.friday,
    },
    saturday: {
      date: saturdayDate.toFormat('yyyy-MM-dd'),
      day: 'saturday',
      label: saturdayDate.toFormat('cccc, LLLL d'),
      window: PICKUP_WINDOWS.saturday,
    },
    cutoffPassed,
    cutoffLabel: cutoff.toFormat("cccc, LLLL d 'at' h:mm a"),
  };
}

// Server-side guard so a stale/tampered pickup date from the client can never
// be attached to a real Square order.
export function isValidPickupSelection(dateISO: string, day: PickupDay, referenceDate?: Date): boolean {
  const availability = getAvailablePickupDates(referenceDate);
  return availability[day].date === dateISO;
}
