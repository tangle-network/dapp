import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';

export function getDisplayValue(val?: string | number): string {
  if (typeof val === 'string') {
    return val;
  }

  if (typeof val === 'number') {
    return val.toLocaleString('en-US');
  }

  return EMPTY_VALUE_PLACEHOLDER;
}
