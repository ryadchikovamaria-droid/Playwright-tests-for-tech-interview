// Converts a 12-hour time string (e.g. "1:30 AM", "11:45 PM") to minutes since midnight.
// Used to compare time values numerically when asserting sort order.
export function timeToMinutes(time: string): number {
  // Extract hours, minutes, and AM/PM period from the time string
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);

  // Throw explicitly rather than returning a sentinel value that could corrupt comparisons silently
  if (!match) throw new Error(`Could not parse time value: "${time}"`);

  // Cast to string tuple after the guard — all groups are guaranteed to be strings at this point
  const [, hours, minutes, period] = match as [string, string, string, string];
  let h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);

  // 12 AM (midnight) is 0 hours in 24-hour time
  if (period.toUpperCase() === "AM" && h === 12) h = 0;

  // 12 PM (noon) stays as 12 — all other PM hours shift up by 12
  if (period.toUpperCase() === "PM" && h !== 12) h += 12;

  return h * 60 + m;
}
