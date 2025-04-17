import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';

const getDisplayValue = (val?: string | number): string => {
  if (typeof val === 'string') {
    return val;
  } else if (typeof val === 'number') {
    return val.toLocaleString('en-US');
  }

  return EMPTY_VALUE_PLACEHOLDER;
};

export default getDisplayValue;
