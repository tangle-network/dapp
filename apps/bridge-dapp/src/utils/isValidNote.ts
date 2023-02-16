/**
 * Checks if a note is valid
 * @param note - Note to be checked
 * @returns - True if the note is valid
 */
export const isValidNote = (note: string): boolean => {
  const regex =
    /^webb:\/\/v\d+:vanchor\/\d+:\d+\/0x[a-fA-F0-9]+:0x[a-fA-F0-9]+\/[a-fA-F0-9]+:[a-fA-F0-9]+:[a-fA-F0-9]+:[a-fA-F0-9]+\/\?curve=\w+&width=\d+&exp=\d+&hf=\w+&backend=\w+&token=\w+&denom=\d+&amount=\d+(&index=\d+)?$/g;

  return regex.test(note);
};
