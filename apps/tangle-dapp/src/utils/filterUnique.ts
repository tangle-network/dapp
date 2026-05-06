const filterUnique = <T>(
  getKey: (item: T) => string,
): ((item: T) => boolean) => {
  const seen = new Set<string>();

  return (item: T) => {
    const key = getKey(item);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  };
};

export default filterUnique;
