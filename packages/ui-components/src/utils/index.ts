export const randomID = (): string => {
  return Math.random().toString(16).slice(3);
};

export const nextTick = (fn: Function): void => {
  setTimeout(fn, 0);
};

export function getInputShadow(noBorder: boolean, error: boolean, focused: boolean): string {
  if (noBorder) {
    return 'none';
  }

  if (error) {
    return '0 0 2px 2px var(--input-shadow-error)';
  }

  if (focused) {
    return '0 0 2px 2px var(--input-shadow)';
  }

  return 'none';
}

export function getInputBorder(noBorder: boolean, error: boolean): string {
  if (noBorder) {
    return 'none';
  }

  if (error) {
    return '1px solid var(--input-border-color-error)';
  }

  return '1px solid var(--input-border-color)';
}

export function getRoundedAmountString(amount: number) {
  if (amount >= 10000000) {
    return `${amount / 1000000}M`;
  } else if (amount >= 100000) {
    return `${amount / 1000}K`;
  } else if (amount.toString().length > 5) {
    return `${amount.toPrecision(4)}`;
  } else {
    return `${amount}`;
  }
}
