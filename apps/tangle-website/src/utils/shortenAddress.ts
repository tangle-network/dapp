export const shortenAddress = (input: string): string => {
  if (input.length <= 8) return input;
  return input.slice(0, 5) + '...' + input.slice(input.length - 3);
};
