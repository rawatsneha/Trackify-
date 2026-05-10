const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3,
  May: 4, Jun: 5, Jul: 6, Aug: 7,
  Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

export const safeParseDate = (str: string) => {
  try {
    const parts = str.trim().split(' ');
    if (parts.length !== 2) return new Date();
    const day = Number(parts[0]);
    const month = MONTHS[parts[1]];
    if (!day || month === undefined) return new Date();
    // ✅ Local date — no UTC shift
    return new Date(2026, month, day);
  } catch {
    return new Date();
  }
};

export const toISODate = (str: string) => {
  const d = safeParseDate(str);
  if (isNaN(d.getTime())) return '';

  // ✅ Use local date parts instead of toISOString() which converts to UTC
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};