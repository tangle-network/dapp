const filterBy = (
  query: string,
  data: Array<string | number | undefined | null>,
): boolean => {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery === '') {
    return true;
  }

  // If at least one of the values in the data array includes the query,
  // return true.
  return data.some((value) => {
    if (value === undefined || value === null) {
      return false;
    }

    const normalizedValue = value.toString().toLowerCase();

    return normalizedValue.includes(normalizedQuery);
  });
};

export default filterBy;
