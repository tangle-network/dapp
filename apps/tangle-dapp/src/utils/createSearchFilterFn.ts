const createSearchFilterFn = <T extends object>(keys: Array<keyof T>) => {
  return (item: T, query: string): boolean => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery === '') {
      return true;
    }

    // In case that the keys contain duplicates.
    const uniqueKeys = new Set(keys);

    return Array.from(uniqueKeys).some((key) => {
      const value = item[key];

      if (!(typeof value === 'string' || typeof value === 'number')) {
        return false;
      }

      const normalizedValue = value.toString().toLowerCase();

      return normalizedValue.includes(normalizedValue);
    });
  };
};

export default createSearchFilterFn;
