'use client';

import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { ConnectWalletMobileButton } from '@webb-tools/webb-ui-components/components/ConnectWalletMobileButton';
import { useCheckMobile } from '@webb-tools/webb-ui-components/hooks/useCheckMobile';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Link from 'next/link';
import { type RefObject, useCallback, useMemo } from 'react';
import type { FieldErrors, UseFormWatch } from 'react-hook-form';

import useNetworkStore from '../../../context/useNetworkStore';
import { DepositFormFields } from '../../../types/restake';
import chainToNetwork from '../../../utils/chainToNetwork';

type Props = {
  watch: UseFormWatch<DepositFormFields>;
  errors: FieldErrors<DepositFormFields>;
  isValid: boolean;
  formRef: RefObject<HTMLFormElement>;
};

export default function ActionButton({
  watch,
  errors,
  isValid,
  formRef,
}: Props) {
  const sourceTypedChainId = watch('sourceTypedChainId');

  const { isMobile } = useCheckMobile();
  const { loading, isConnecting, activeWallet, activeApi } = useWebContext();
  const { toggleModal } = useConnectWallet();
  const switchChain = useSwitchChain();

  const { isLoading, loadingText } = useMemo(() => {
    if (isConnecting)
      return {
        isLoading: true,
        loadingText: 'Connecting...',
      };

    if (loading)
      return {
        isLoading: true,
        loadingText: 'Loading...',
      };

    return {};
  }, [isConnecting, loading]);

  if (isMobile) {
    return (
      <ConnectWalletMobileButton title="Try Hubble on Desktop" isFullWidth>
        <Typography variant="body1">
          A complete mobile experience for Hubble Bridge is in the works. For
          now, enjoy all features on a desktop device.
        </Typography>
        <Typography variant="body1">
          Visit the link on desktop below to start transacting privately!
        </Typography>
        <Button as={Link} href="deposit" variant="link">
          {window.location.href}
        </Button>
      </ConnectWalletMobileButton>
    );
  }

  // If the user is not connected to a wallet, show the connect wallet button
  if (activeWallet === undefined || activeApi === undefined) {
    return (
      <Button
        type="button"
        isFullWidth
        onClick={() => toggleModal(true, sourceTypedChainId)}
      >
        Connect Wallet
      </Button>
    );
  }

  const displayError =
    errors.sourceTypedChainId !== undefined
      ? `Select a source chain`
      : errors.depositAssetId !== undefined
        ? `Select an asset`
        : errors.amount !== undefined
          ? `Enter an amount`
          : undefined;

  if (activeApi.typedChainidSubject.getValue() !== sourceTypedChainId) {
    const handleClick = async () => {
      const result = await switchChain(sourceTypedChainId);
      const isSuccessful = result !== null && result !== undefined;

      // Dispatch submit event to trigger form submission
      // when the chain switch is successful and the form is valid
      if (isSuccessful && isValid && displayError === undefined) {
        formRef.current?.dispatchEvent(
          new Event('submit', { cancelable: true }),
        );
      }
    };

    return (
      <Button
        isLoading={isLoading}
        loadingText={loadingText}
        type="button"
        isFullWidth
        onClick={handleClick}
      >
        Switch Chain
      </Button>
    );
  }

  return (
    <Button
      isLoading={isLoading}
      loadingText={loadingText}
      type="submit"
      isDisabled={!isValid || displayError !== undefined}
      isFullWidth
    >
      {displayError ?? 'Deposit'}
    </Button>
  );
}

function useSwitchChain() {
  const { activeWallet, activeApi, switchChain } = useWebContext();
  const { toggleModal } = useConnectWallet();
  const { setNetwork } = useNetworkStore();

  return useCallback(
    async (typedChainId: number) => {
      if (activeWallet === undefined || activeApi === undefined) {
        return toggleModal(true, typedChainId);
      }

      const nextChain = chainsPopulated[typedChainId];
      if (nextChain === undefined) return;

      const isWalletSupported = nextChain.wallets.includes(activeWallet.id);

      if (!isWalletSupported) {
        return toggleModal(true, typedChainId);
      } else {
        const switchResult = await switchChain(nextChain, activeWallet);
        if (switchResult !== null) {
          const nextNetwork = chainToNetwork(typedChainId);
          setNetwork(nextNetwork);
        }

        return switchResult;
      }
    },
    [activeApi, activeWallet, setNetwork, switchChain, toggleModal],
  );
}
