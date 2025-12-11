import { OperatorPreferences } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';

/**
 * Calculate the total pricing from operator preferences.
 * @dev should format data to human readable before using this function
 */
export const getOperatorPricing = (
  operatorPreferences: OperatorPreferences['priceTargets'],
) => {
  return Object.values(operatorPreferences).reduce((acc, curr) => {
    return acc + Number(curr);
  }, 0);
};
