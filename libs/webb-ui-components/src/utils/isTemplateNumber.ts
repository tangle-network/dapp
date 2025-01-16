export const isTemplateNumber = (value: unknown): value is `${number}` => {
  if (typeof value !== 'string') {
    return false;
  }

  const parsedNumber = Number(value);

  return !isNaN(parsedNumber);
};
