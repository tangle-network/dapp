'use client';

import { useContext } from 'react';
import RestakeContext from './RestakeContext';

const useRestakeContext = () => useContext(RestakeContext);

export default useRestakeContext;
