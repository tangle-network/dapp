const formatPercentage = (percentage: number): `${string}%` => {
  const percentageString = percentage.toFixed(2);

  // If the percentage is 0, we want to display '<0.01' instead of '0.00'.
  // This helps avoid confusing the user to believe that the value is 0.
  const finalPercentageString =
    percentageString === '0.00' ? '<0.01' : percentageString;

  return `${finalPercentageString}%`;
};

export default formatPercentage;
