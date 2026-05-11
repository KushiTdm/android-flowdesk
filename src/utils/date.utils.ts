// ---------------------------------------------------------------------------
// date.utils.ts — Date formatting helpers using date-fns with French locale
// ---------------------------------------------------------------------------

import { format, isToday as dfIsToday, parseISO, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

/** "14:30" */
export function formatTimeHHMM(date: Date): string {
  return format(date, 'HH:mm', { locale: fr });
}

/** "Vendredi 9 mai" */
export function formatDateDisplay(date: Date): string {
  return format(date, 'EEEE d MMMM', { locale: fr });
}

/** "9 mai" */
export function formatDateShort(date: Date): string {
  return format(date, 'd MMMM', { locale: fr });
}

/** Returns true if the given date is today */
export function isToday(date: Date): boolean {
  return dfIsToday(date);
}

/** ISO string → "14:30 - 15:30" */
export function isoToDisplay(iso: string): string {
  const date = parseISO(iso);
  return formatTimeHHMM(date);
}

/** ISO string → "14:30" */
export function isoToTime(iso: string): string {
  return formatTimeHHMM(parseISO(iso));
}

/** "1h30" label from two ISO strings */
export function durationLabel(startIso: string, endIso: string): string {
  const start = parseISO(startIso);
  const end = parseISO(endIso);
  const totalMinutes = differenceInMinutes(end, start);

  if (totalMinutes <= 0) return '0min';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}
