// Sort by date (reverse chronological: newest first)
// - Non-mutating: returns a new array
// - Missing or invalid dates are pushed to the end
// - Accepts any entry shape with data.date (Date | string | undefined)
export const sortByDate = <T extends { data: { date?: any } }>(
  array: T[],
): T[] => {
  return [...array].sort((a, b) => {
    const aTime = normalizeDate(a.data.date);
    const bTime = normalizeDate(b.data.date);
    // Newest first
    return bTime - aTime;
  });
};

// Helper: normalize date-like input to a timestamp number.
// Returns -Infinity for missing/invalid dates so they fall to the bottom.
function normalizeDate(value: unknown): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  try {
    // Support Date instance or parseable string
    const d = value instanceof Date ? value : new Date(value as string);
    const t = d.valueOf();
    return isNaN(t) ? Number.NEGATIVE_INFINITY : t;
  } catch {
    return Number.NEGATIVE_INFINITY;
  }
}

// sort product by weight
export const sortByWeight = (array: any[]) => {
  const withWeight = array.filter(
    (item: { data: { weight: any } }) => item.data.weight,
  );
  const withoutWeight = array.filter(
    (item: { data: { weight: any } }) => !item.data.weight,
  );
  const sortedWeightedArray = withWeight.sort(
    (a: { data: { weight: number } }, b: { data: { weight: number } }) =>
      a.data.weight - b.data.weight,
  );
  const sortedArray = [...new Set([...sortedWeightedArray, ...withoutWeight])];
  return sortedArray;
};
