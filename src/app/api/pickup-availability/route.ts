import { NextResponse } from 'next/server';
import { getAvailablePickupDates } from '@/lib/pickup';
import { getPickupWindows } from '@/lib/squareHours';

// Serves live pickup windows (read from the Square location's own business
// hours) to client components — the date/cutoff math in lib/pickup.ts stays
// pure and client-safe, but the window text requires a server-side Square call.
export async function GET() {
  const availability = getAvailablePickupDates();
  const windows = await getPickupWindows();

  return NextResponse.json({
    friday: { ...availability.friday, window: windows.friday.display },
    saturday: { ...availability.saturday, window: windows.saturday.display },
    cutoffPassed: availability.cutoffPassed,
    cutoffLabel: availability.cutoffLabel,
  });
}
