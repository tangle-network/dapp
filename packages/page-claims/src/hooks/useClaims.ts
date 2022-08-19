import { PresetTypedChainId, WebbWeb3Provider } from '@webb-dapp/api-providers';
import { WalletId } from '@webb-dapp/apps/configs';
import { useWebContext } from '@webb-dapp/react-environment';
import React, { useCallback, useEffect, useMemo } from 'react';

import { decodeAddress } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

export function useClaims() {
  const { activeApi, chains, switchChain, wallets } = useWebContext();
  const [address, setAddress] = React.useState('');
  const [error, setError] = React.useState('');
  const [validProvider, setIsValidProvider] = React.useState(true);

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

  useEffect(() => {
    if (activeApi) {
      const isWeb3 = activeApi instanceof WebbWeb3Provider;
      if (isWeb3) {
        setIsValidProvider(true);
      } else {
        setIsValidProvider(false);
      }
    } else {
      setIsValidProvider(false);
    }
  }, [activeApi]);

  const generateSignature = useCallback(async () => {
    if (activeApi) {
      const isWeb3 = activeApi instanceof WebbWeb3Provider;
      if (!isWeb3) {
        throw new Error('Expected web3 provider to be active');
      }
      const isHexAddress = address.startsWith('0x');
      let parsedAddress: `0x${string}`;
      if (isHexAddress && address.replace('0x', '').length === 64) {
        parsedAddress = address as `0x${string}`;
      } else {
        // ss58 format
        const decodedAddress = decodeAddress(address);
        parsedAddress = u8aToHex(decodedAddress);
      }

      const signature = await activeApi.sign(parsedAddress);
      return signature as string;
    } else {
      throw new Error('No active api');
    }
  }, [activeApi, address]);

  const switchToPolkadotWallet = async () => {
    //EGG chainsId on dev
    const typedChainId = PresetTypedChainId.ProtocolSubstrateStandalone;
    const chain = chains[typedChainId];
    const wallet = wallets[WalletId.Polkadot];
    await switchChain(chain, wallet);
  };
  const submitClaim = async (address: string, claim: Uint8Array) => {
    if (activeApi) {
      const hash = await activeApi.methods.claim.core.claim(address, claim);
      return hash;
    } else {
      throw new Error('No active api');
    }
  };
  return {
    generateSignature,
    submitClaim,
    switchToPolkadotWallet,
    address,
    setAddress,
    validProvider,
    isValidKey,
    ready: Boolean(activeApi),
    error,
  };
}
