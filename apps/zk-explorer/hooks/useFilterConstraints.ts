import { useState, useEffect } from 'react';
import { useUrlParam, UrlParamKey } from './useUrlParam';
import { FilterConstraints } from '../components/Filters/types';

export const useFilterConstraints = (): [
  FilterConstraints,
  (newConstraints: FilterConstraints) => void
] => {
  const [filterParam, setFilterParam] = useUrlParam(UrlParamKey.Filters);
  const [constraints, setConstraints] = useState<FilterConstraints>({});

  useEffect(() => {
    try {
      const parsedConstraints = filterParam ? JSON.parse(filterParam) : {};
      setConstraints(parsedConstraints);
    } catch (_error) {
      // Handle parsing error if necessary
    }
  }, [filterParam]);

  const updateConstraints = (newConstraints: FilterConstraints) => {
    // Remove empty constraints.
    const processedConstraints = Object.entries(newConstraints).reduce(
      (acc, [key, value]) => {
        if (value.length > 0) {
          acc[key] = value;
        }

        return acc;
      },
      {} as FilterConstraints
    );

    const areFiltersEmpty =
      Object.keys(processedConstraints).length === 0 ||
      Object.values(processedConstraints).every((value) => value.length === 0);

    if (areFiltersEmpty) {
      setFilterParam(null);

      return;
    }

    setConstraints(processedConstraints);
    setFilterParam(JSON.stringify(processedConstraints));
  };

  return [constraints, updateConstraints];
};
