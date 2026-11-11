// Форма слова для числа: plural(2, ['день', 'дні', 'днів']) -> 'дні'.
export function plural(n, [one, few, many]) {
  const abs = Math.abs(n);
  const d10 = abs % 10;
  const d100 = abs % 100;
  if (d10 === 1 && d100 !== 11) return one;
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return few;
  return many;
}

export const SETS_FORMS = ['підхід', 'підходи', 'підходів'];
export const DAYS_FORMS = ['день', 'дні', 'днів'];
