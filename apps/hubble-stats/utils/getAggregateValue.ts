const getAggregateValue = (
  object: Record<number, number | undefined>
): number | undefined => {
  return Object.values(object).reduce((total, value) => {
    const currentTotal = typeof total === 'number' ? total : 0;
    if (value === undefined) return currentTotal;
    return currentTotal + value;
  }, 0);
};

export default getAggregateValue;
