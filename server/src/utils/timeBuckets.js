import { env } from '../config/env.js';

export const TIME_PERIODS = [
  'Early Morning (6–9)',
  'Morning (9–12)',
  'Afternoon (12–16)',
  'Evening (16–20)',
  'Late (20–6)'
];

export const DAY_TYPES = ['Weekday', 'Weekend'];

/**
 * Parses timezone input which may be an IANA string ("Asia/Kolkata"),
 * an offset string ("+05:30", "-04:00"), or numeric minutes.
 * Returns { hour, dayOfWeek, dayType, timePeriod }
 */
export function deriveTimePeriodAndDayType(visitedAt, tzInput = env.TZ_OFFSET) {
  const date = visitedAt instanceof Date ? visitedAt : new Date(visitedAt);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date provided to deriveTimePeriodAndDayType');
  }

  let hour;
  let weekdayName;

  // Check if tzInput is an offset string (e.g. "+05:30", "-04:00", "Z")
  const offsetMatch = typeof tzInput === 'string' && tzInput.match(/^([+-])(\d{1,2}):?(\d{2})?$/);

  if (offsetMatch) {
    const sign = offsetMatch[1] === '-' ? -1 : 1;
    const hours = parseInt(offsetMatch[2], 10);
    const minutes = offsetMatch[3] ? parseInt(offsetMatch[3], 10) : 0;
    const offsetMs = sign * (hours * 60 + minutes) * 60 * 1000;
    const targetTime = new Date(date.getTime() + offsetMs);
    hour = targetTime.getUTCHours();
    const day = targetTime.getUTCDay(); // 0 is Sunday, 6 is Saturday
    weekdayName = day === 0 || day === 6 ? 'Weekend' : 'Weekday';
  } else {
    // Treat as IANA timezone string, default to Asia/Kolkata
    const timeZone = tzInput || 'Asia/Kolkata';
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        hour12: false,
        weekday: 'short'
      });
      const parts = formatter.formatToParts(date);
      const hourPart = parts.find((p) => p.type === 'hour');
      const weekdayPart = parts.find((p) => p.type === 'weekday');

      hour = parseInt(hourPart?.value || '0', 10);
      // In some locales/engines, hour 24 might be reported for midnight
      if (hour === 24) hour = 0;

      const dayStr = weekdayPart?.value?.toLowerCase() || '';
      weekdayName = dayStr.startsWith('sat') || dayStr.startsWith('sun') ? 'Weekend' : 'Weekday';
    } catch {
      // Fallback to UTC if timezone string was unrecognized
      hour = date.getUTCHours();
      const day = date.getUTCDay();
      weekdayName = day === 0 || day === 6 ? 'Weekend' : 'Weekday';
    }
  }

  // Derive time period bucket
  // Early Morning (6–9): 6 <= hour < 9
  // Morning (9–12): 9 <= hour < 12
  // Afternoon (12–16): 12 <= hour < 16
  // Evening (16–20): 16 <= hour < 20
  // Late (20–6): hour >= 20 || hour < 6
  let timePeriod;
  if (hour >= 6 && hour < 9) {
    timePeriod = 'Early Morning (6–9)';
  } else if (hour >= 9 && hour < 12) {
    timePeriod = 'Morning (9–12)';
  } else if (hour >= 12 && hour < 16) {
    timePeriod = 'Afternoon (12–16)';
  } else if (hour >= 16 && hour < 20) {
    timePeriod = 'Evening (16–20)';
  } else {
    timePeriod = 'Late (20–6)';
  }

  return {
    hour,
    dayType: weekdayName,
    timePeriod
  };
}
