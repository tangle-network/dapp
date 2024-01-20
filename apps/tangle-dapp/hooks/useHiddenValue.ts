import useLocalStorageState from 'use-local-storage-state';

/**
 * Hook to sync and set the hidden value flag in local storage
 * @returns `[isHiddenValue, setIsHiddenValue]`
 */
function useHiddenValue() {
  return useLocalStorageState('isHiddenValue', {
    defaultValue: false,
  });
}

export default useHiddenValue;
