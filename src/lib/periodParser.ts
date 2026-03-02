/**
 * Period Parser — accepts free-text with dates in various formats.
 * Returns sorted, consolidated intervals as [start, end] Date pairs.
 * Convention: both dates inclusive; 1 month = 30 days; 1 year = 365 days.
 */

const DATE_RE =
  /(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/g;

function parseDate(d: string, m: string, y: string): Date | null {
  let day = parseInt(d, 10);
  let month = parseInt(m, 10) - 1;
  let year = parseInt(y, 10);
  if (year < 100) year += year < 50 ? 2000 : 1900;
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const dt = new Date(year, month, day);
  if (isNaN(dt.getTime())) return null;
  return dt;
}

export interface Period {
  start: Date;
  end: Date;
}

export function parsePeriods(text: string): Period[] {
  if (!text.trim()) return [];
  const dates: Date[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(DATE_RE.source, 'g');
  while ((match = re.exec(text)) !== null) {
    const dt = parseDate(match[1], match[2], match[3]);
    if (dt) dates.push(dt);
  }
  // group in pairs
  const periods: Period[] = [];
  for (let i = 0; i + 1 < dates.length; i += 2) {
    let a = dates[i], b = dates[i + 1];
    if (a > b) [a, b] = [b, a];
    periods.push({ start: a, end: b });
  }
  return periods;
}

export function consolidate(periods: Period[]): Period[] {
  if (periods.length === 0) return [];
  const sorted = [...periods].sort((a, b) => a.start.getTime() - b.start.getTime());
  const result: Period[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = result[result.length - 1];
    const cur = sorted[i];
    // Contiguous: next day or overlapping
    const nextDay = new Date(last.end);
    nextDay.setDate(nextDay.getDate() + 1);
    if (cur.start <= nextDay) {
      if (cur.end > last.end) last.end = cur.end;
    } else {
      result.push({ ...cur });
    }
  }
  return result;
}

/** Count days inclusive */
export function countDays(periods: Period[]): number {
  let total = 0;
  for (const p of periods) {
    const diff = Math.floor((p.end.getTime() - p.start.getTime()) / 86400000) + 1;
    if (diff > 0) total += diff;
  }
  return total;
}

/** Intersect accepted periods with disputed periods (limit to universe) */
export function intersect(disputed: Period[], accepted: Period[]): Period[] {
  const result: Period[] = [];
  for (const a of accepted) {
    for (const d of disputed) {
      const start = new Date(Math.max(a.start.getTime(), d.start.getTime()));
      const end = new Date(Math.min(a.end.getTime(), d.end.getTime()));
      if (start <= end) {
        result.push({ start, end });
      }
    }
  }
  return consolidate(result);
}

export function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatPeriods(periods: Period[]): string {
  return periods.map(p => `${formatDate(p.start)} a ${formatDate(p.end)}`).join('; ');
}
