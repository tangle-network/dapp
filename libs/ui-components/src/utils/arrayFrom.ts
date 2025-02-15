export const arrayFrom = <T>(length: number, callback: () => T): T[] => {
  return Array.from({ length }, callback);
};
