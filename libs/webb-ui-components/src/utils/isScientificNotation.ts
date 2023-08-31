function isScientificNotation(value: number): boolean {
  const stringValue = value.toString();
  const scientificNotationRegex = /\d+\.?\d*e[+-]*\d+/i;
  return scientificNotationRegex.test(stringValue);
}

export default isScientificNotation;
