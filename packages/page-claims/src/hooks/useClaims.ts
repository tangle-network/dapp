import { useWebContext } from '@webb-dapp/react-environment';
import React, { useEffect, useMemo } from 'react';

import { decodeAddress } from '@polkadot/keyring';

export function useClaims() {
  const { activeApi } = useWebContext();
  const [address, setAddress] = React.useState('');
  const [error, setError] = React.useState('');
  useEffect(() => {
    const isHex = address.startsWith('0x');
    const isEmpty = address.trim() === '';
    if (isEmpty) {
      setError('');
      return;
    }
    if (isHex) {
      if (address.replace('0x', '').length !== 64) {
        setError('Invalid public key expected 32 bytes hex string , or ss58 format');
        return;
      } else {
        setError('');
      }
    } else {
      // assume ss58 format
      try {
        decodeAddress(address);
        setError('');
      } catch (e) {
        console.log(e);
        setError('Invalid public key expected 32 bytes hex string , or ss58 format');
        return;
      }
    }
  }, [address]);
  const isValidKey = useMemo(() => error === '', [error]);

  return {
    address,
    setAddress,
    isValidKey,
    ready: Boolean(activeApi),
    error,
  };
}
