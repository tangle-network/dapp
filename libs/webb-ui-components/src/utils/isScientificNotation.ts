function isScientificNotation(value: number): boolean {
  const stringValue = value.toString();
  if (stringValue.length > 1000) {
    console.error('isScientificNotation: value is too long');
    return false;
  }
  const scientificNotationRegex = /^[+-]?\d+(\.\d+)?e[+-]?\d+$/i;
  return scientificNotationRegex.test(stringValue);
}

export default isScientificNotation;
