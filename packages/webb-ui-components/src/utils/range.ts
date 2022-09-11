/**
 * Create an array of number from range `start` to `end`
 * @param start The start value
 * @param end The end value
 * @returns An array of numbers start from `start` and end at `end`
 */
export const range = (start: number, end: number): number[] => {
  if (start > end) {
    const tmp = start;
    start = end;
    end = tmp;
  }

  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => start + idx);
};
