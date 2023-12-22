'use client';

import { isEthereumAddress } from '@polkadot/util-crypto';
import type { Account } from '@webb-tools/abstract-api-provider';
import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import type { Nullable } from '@webb-tools/dapp-types/utils/types';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { Spinner } from '@webb-tools/icons';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { BN } from 'bn.js';
import { useCallback, useEffect, useState } from 'react';

import { getPolkadotApiPromise } from '../../constants/polkadot';
import EligibleSection from './EligibleSection';
import NotEligibleSection from './NotEligibleSection';

const eligibilityCache = new Map<string, boolean>();

const checkClaimEligibility = async (
  accountAddress: string,
  options?: { force?: boolean }
): Promise<boolean> => {
  // Check cache
  const cached = eligibilityCache.get(accountAddress);
  if (typeof cached === 'boolean' && !options?.force) {
    return cached;
  }

  const api = await getPolkadotApiPromise();
  if (!api) {
    throw WebbError.from(WebbErrorCodes.ApiNotReady);
  }

  const claimAmount = await api.query.claims.claims(
    isEthereumAddress(accountAddress)
      ? {
          EVM: accountAddress,
        }
      : {
          Native: accountAddress,
        }
  );

  const amount = claimAmount.unwrapOr(null);
  /* const eligible = amount !== null && amount.gt(new BN(0));

  // Cache result
  eligibilityCache.set(accountAddress, eligible);

  return eligible; */
  return true;
};

function ClaimSection() {
  const { toggleModal, isWalletConnected } = useConnectWallet();
  const { activeAccount, loading, isConnecting } = useWebContext();
  const { notificationApi } = useWebbUI();

  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligible, setEligible] = useState<Nullable<boolean>>(null);

  const checkEligibility = useCallback(
    async (activeAccount: Account, force?: boolean) => {
      try {
        setCheckingEligibility(true);

        const isEligible = await checkClaimEligibility(activeAccount.address, {
          force,
        });
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
    },
    [notificationApi]
  );

  useEffect(() => {
    if (!activeAccount) return;

    checkEligibility(activeAccount);
  }, [isWalletConnected, activeAccount, notificationApi, checkEligibility]);

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
        overrideSubTitleProps={{
          className: 'text-blue-70 dark:text-blue-50',
        }}
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
          <NotEligibleSection checkEligibility={checkEligibility} />
        ) : null}
      </AppTemplate.Body>
    </AppTemplate.Content>
  );
}

export default ClaimSection;
