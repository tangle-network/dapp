'use client';

import { providers } from 'ethers';
import { useEffect, useState } from 'react';

export default function useEthersSigner() {
  const [ethersSigner, setEthersSigner] =
    useState<providers.JsonRpcSigner | null>(null);

  useEffect(() => {
    if (!window || !window.ethereum) {
      return;
    }
    const provider = new providers.Web3Provider(window.ethereum, 'any');
    console.log('provider :', provider);
    const signer = provider.getSigner();
    setEthersSigner(signer);
  }, []);

  return ethersSigner;
}
