'use client';

import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import type { Nullable } from '@webb-tools/dapp-types/utils/types';
import { Spinner } from '@webb-tools/icons';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useEffect, useState } from 'react';

import EligibleSection from './EligibleSection';
import NotEligibleSection from './NotEligibleSection';

const eligibilityCache = new Map<string, boolean>();

const checkEligibility = async (accountAddress: string): Promise<boolean> => {
  // Check cache
  const cached = eligibilityCache.get(accountAddress);
  if (typeof cached === 'boolean') {
    return cached;
  }

  // Simulate a 2s delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Cache result
  eligibilityCache.set(accountAddress, true);

  return true;
};

function ClaimSection() {
  const { toggleModal, isWalletConnected } = useConnectWallet();
  const { activeAccount, loading, isConnecting } = useWebContext();
  const { notificationApi } = useWebbUI();

  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligible, setEligible] = useState<Nullable<boolean>>(null);

  useEffect(() => {
    if (!isWalletConnected || !activeAccount) return;

    const check = async () => {
      try {
        setCheckingEligibility(true);

        const isEligible = await checkEligibility(activeAccount.address);
        setEligible(isEligible);
      } catch (error) {
        console.log(error);
        notificationApi({
          message: 'Failed to check eligibility',
          variant: 'error',
        });
      } finally {
        setCheckingEligibility(false);
      }
    };

    check();
  }, [isWalletConnected, activeAccount, notificationApi]);

  return (
    <AppTemplate.Content>
      <AppTemplate.Title
        title={
          eligible === null
            ? 'Claim your $TNT Aidrop'
            : eligible
            ? 'You have unclaimed $TNT Airdrop!'
            : 'You are not eligible for $TNT Airdrop'
        }
        subTitle={
          eligible === null
            ? 'CLAIM AIRDROP'
            : eligible
            ? 'GREATE NEWS!'
            : 'OOPS!'
        }
      />

      <AppTemplate.DescriptionContainer>
        <AppTemplate.Description
          variant="mkt-body2"
          className="text-mono-140 dark:text-mono-80"
        >
          {eligible === null ? (
            <>
              As part of {"Tangle's"} initial launch, the Tangle Network is
              distributing 5,000,000 TNT tokens to the community. Check
              eligibility below to see if you qualify for TNT Airdrop!
            </>
          ) : eligible ? (
            <>
              Looks like you are eligible for $TNT airdrop! View your tokens
              below, and start the claiming process.
            </>
          ) : (
            <>
              Looks like you are not eligible for $TNT airdrop. You can still
              participate in the Tangle Network by purchasing $TNT or try again
              with a different account.
            </>
          )}
        </AppTemplate.Description>
      </AppTemplate.DescriptionContainer>

      <AppTemplate.Body>
        {!isWalletConnected ? (
          <>
            <Typography variant="mkt-body2" ta="center" fw="bold">
              Connect your EVM or Substrate wallet to check eligibility:
            </Typography>

            <div className="space-y-2">
              <Button
                isFullWidth
                isDisabled={loading || isConnecting}
                onClick={() =>
                  toggleModal(true, PresetTypedChainId.TangleTestnet)
                }
              >
                Connect EVM Wallet
              </Button>
              <Button
                variant="secondary"
                isDisabled={loading || isConnecting}
                isFullWidth
                onClick={() =>
                  toggleModal(true, PresetTypedChainId.TangleStandaloneTestnet)
                }
              >
                Connect Substrate Wallet
              </Button>
            </div>
          </>
        ) : checkingEligibility ? (
          <>
            <Typography variant="mkt-body2" ta="center" fw="bold">
              Checking eligibility...
            </Typography>

            <Spinner size="lg" className="mx-auto" />
          </>
        ) : eligible === true ? (
          <EligibleSection />
        ) : eligible === false ? (
          <NotEligibleSection />
        ) : null}
      </AppTemplate.Body>
    </AppTemplate.Content>
  );
}

export default ClaimSection;
