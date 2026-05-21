import { format, parseISO, isValid } from 'date-fns';

/** Clave yyyy-MM-dd en hora local (evita desfase vs UTC al guardar "hoy"). */
export function localDateKey(d: Date = new Date()): string {
  return format(d, 'yyyy-MM-dd');
}

/** Normaliza `date` devuelto por Supabase (date o timestamptz) a yyyy-MM-dd. */
export function trainingDateKey(date: string): string {
  if (!date) return '';
  const s = date.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  try {
    const parsed = parseISO(date);
    if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
  } catch {
    /* ignore */
  }
  return s;
}
