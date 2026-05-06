const cleanNumericInputString = (input: string): string => {
  let wasPeriodSeen = false;

  return input
    .split('')
    .filter((char) => {
      if (char === '.' && !wasPeriodSeen) {
        wasPeriodSeen = true;

        return true;
      }

      // Only consider digits. Ignore any other characters.
      return /\d/.test(char);
    })
    .join('');
};

export default cleanNumericInputString;
