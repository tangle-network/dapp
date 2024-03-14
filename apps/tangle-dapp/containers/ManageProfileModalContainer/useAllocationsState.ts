import { useCallback, useEffect, useState } from 'react';

import useRestakingAllocations from '../../data/restaking/useRestakingAllocations';
import useRestakingProfile from '../../data/restaking/useRestakingProfile';
import { RestakingProfileType } from '../../types';
import { RestakingAllocationMap } from './types';

const useAllocationsState = (intendedProfileType: RestakingProfileType) => {
  const { value: substrateAllocationsOpt, isLoading } =
    useRestakingAllocations();

  const { profileTypeOpt } = useRestakingProfile();
  const [allocations, setAllocations] = useState<RestakingAllocationMap>({});

  // Only change the allocations when the substrate allocations
  // are fetched and the active profile type matches the intended
  // profile type (i.e. the profile type of the modal that is open).
  const areSubstrateAllocationsOfIntendedProfileType =
    profileTypeOpt?.value === intendedProfileType;

  // Update the allocations when the substrate allocations are fetched.
  useEffect(() => {
    if (
      substrateAllocationsOpt !== null &&
      substrateAllocationsOpt.value !== null &&
      !isLoading &&
      areSubstrateAllocationsOfIntendedProfileType
    ) {
      setAllocations(substrateAllocationsOpt.value);
    }
  }, [
    substrateAllocationsOpt,
    isLoading,
    intendedProfileType,
    areSubstrateAllocationsOfIntendedProfileType,
  ]);

  const reset = useCallback(() => {
    if (areSubstrateAllocationsOfIntendedProfileType) {
      // It is possible that there are no allocations for the
      // intended profile type. In that case, the allocations
      // will be set to an empty object.
      setAllocations(substrateAllocationsOpt?.value ?? {});
    }
    // If the active profile type does not match the intended profile
    // type, reset the allocations to an empty object.
    else {
      setAllocations({});
    }
  }, [
    areSubstrateAllocationsOfIntendedProfileType,
    substrateAllocationsOpt?.value,
  ]);

  const setAllocationsOverride = useCallback(
    (newAllocations: RestakingAllocationMap) => {
      setAllocations(newAllocations);
    },
    []
  );

  return {
    reset,
    isLoading,
    allocations,
    setAllocations: setAllocationsOverride,
    setAllocationsDispatch: setAllocations,
  };
};

export default useAllocationsState;
