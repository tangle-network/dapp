import useLocalStorageState from 'use-local-storage-state';

/**
 * Hook to sync and set the hidden value flag in local storage
 * @returns `[isHiddenValue, setIsHiddenValue]`
 */
export function useHiddenValue() {
  return useLocalStorageState('isHiddenValue', {
    defaultValue: false,
  });
}
