import addCommasToNumber from './addCommasToNumber';

const formatFractional = (fractional: number): `${string}%` => {
  const fractionalString = (fractional * 100).toFixed(2);

  // If the percentage is 0, display '<0.01' instead of '0.00'.
  // This helps avoid confusing the user to believe that the value is 0.
  if (fractionalString === '0.00' && fractional !== 0) {
    return '<0.01%';
  }

  const [whole, decimal] = fractionalString.split('.');
  const wholeWithCommas = addCommasToNumber(whole);

  return `${wholeWithCommas}.${decimal}%`;
};

export default formatFractional;
