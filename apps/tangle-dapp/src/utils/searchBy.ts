const searchBy = (
  query: string,
  data: Array<string | number | undefined | null>,
): boolean => {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery === '') {
    return true;
  }

  return data.some((value) => {
    if (value === undefined || value === null) {
      return false;
    }

    const normalizedValue = value.toString().toLowerCase();

    return normalizedValue.includes(normalizedQuery);
  });
};

export default searchBy;
