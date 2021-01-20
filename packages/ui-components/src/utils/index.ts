export const randomID = (): string => {
  return Math.random().toString(16).slice(3);
};

export const nextTick = (fn: Function): void => {
  setTimeout(fn, 0);
};

export function getInputShadow (noBorder: boolean, error: boolean, focused: boolean): string {
  if (noBorder) return 'none';

  if (error) return '0 0 2px 2px var(--input-shadow-error)';

  if (focused) return '0 0 2px 2px var(--input-shadow)';

  return 'none';
}

export function getInputBorder (noBorder: boolean, error: boolean): string {
  if (noBorder) return 'none';

  if (error) return '1px solid var(--input-border-color-error)';

  return '1px solid var(--input-border-color)';
}
