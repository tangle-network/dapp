function isScientificNotation(value: number): boolean {
  return /\d+\.?\d*e[+-]*\d+/i.test(value.toString());
}

export default isScientificNotation;
