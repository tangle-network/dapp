import { useEffect, useLayoutEffect } from 'react';
import isBrowser from '../utils/isBrowser';

const useIsomorphicEffect = isBrowser() ? useLayoutEffect : useEffect;

export default useIsomorphicEffect;
