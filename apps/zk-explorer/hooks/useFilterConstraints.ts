import { cloneDeep } from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FilterConstraints } from '../containers/Filters/types';
import { SearchParamKey, setSearchParam } from '../utils';

const useFilterConstraints = (): [
  FilterConstraints,
  (newConstraints: FilterConstraints) => void
] => {
  const constraintsSearchParam = useSearchParams().get(SearchParamKey.Filters);

  const initialConstraints: FilterConstraints =
    constraintsSearchParam !== null ? JSON.parse(constraintsSearchParam) : {};

  const [constraints, setConstraints] =
    useState<FilterConstraints>(initialConstraints);

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

    // Reflect the new constraints in the URL's search params.
    setSearchParam(
      SearchParamKey.Filters,
      areFiltersEmpty ? null : JSON.stringify(processedConstraints)
    );

    setConstraints(areFiltersEmpty ? {} : cloneDeep(processedConstraints));
  };

  return [constraints, updateConstraints];
};

export default useFilterConstraints;
