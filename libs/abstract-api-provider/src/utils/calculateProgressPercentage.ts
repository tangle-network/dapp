/**
 * Calculates the percentage of the progress
 * @param start the start of the progress
 * @param end the end of the progress
 * @param current the current progress
 * @returns the percentage of the progress (0-100)
 */
function calculateProgressPercentage(
  start: number,
  end: number,
  current: number
): number {
  const percentage = ((current - start) / (end - start + 1)) * 100;

  return percentage >= 100 ? 100 : percentage;
}

export default calculateProgressPercentage;
