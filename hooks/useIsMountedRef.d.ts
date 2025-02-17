/**
 * An utility hook to abstract the pattern of checking whether
 * the component is mounted or not in callbacks inside effects,
 * to prevent memory leaks.
 */
declare const useIsMountedRef: () => import('../../../../node_modules/react').MutableRefObject<boolean>;
export default useIsMountedRef;
