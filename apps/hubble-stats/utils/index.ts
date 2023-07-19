export const convertChainChipTitle = (chainName: string): string => {
  if (chainName.includes('Goerli')) return 'Goerli';
  if (chainName === 'Polygon Mumbai') return 'Mumbai';
  if (chainName === 'Moonbase Alpha' || chainName === 'Scroll Alpha')
    return 'Alpha';
  if (chainName === 'Avalanche Fuji') return 'Fuji';

  return chainName;
};
