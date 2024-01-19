'use client';

import type { Option, u128 } from '@polkadot/types';
import type { PalletAirdropClaimsStatementKind } from '@polkadot/types/lookup';
import { formatBalance } from '@polkadot/util';
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
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getPolkadotApiPromise } from '../../constants/polkadot';
import EligibleSection from './EligibleSection';
import NotEligibleSection from './NotEligibleSection';
import type { ClaimInfoType } from './types';

export default function Page() {
  const { toggleModal, isWalletConnected } = useConnectWallet();
  const { activeAccount, loading, isConnecting } = useWebContext();
  const { notificationApi } = useWebbUI();

  // Default to null to indicate that we are still checking
  // If false, then we know that the user is not eligible
  // Otherwise, the state will be the claim info
  const [claimInfo, setClaimInfo] =
    useState<Nullable<ClaimInfoType | false>>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const { title, subTitle } = useMemo(() => {
    if (claimInfo === null) {
      return {
        title: 'Claim your $TNT Aidrop',
        subTitle: 'CLAIM AIRDROP',
      };
    }

    if (claimInfo === false) {
      return {
        title: 'You are not eligible for $TNT Airdrop',
        subTitle: 'OOPS!',
      };
    }

    return {
      title: 'You have unclaimed $TNT Airdrop!',
      subTitle: 'GREAT NEWS!',
    };
  }, [claimInfo]);

  const checkEligibility = useCallback(
    async (
      activeAccount: Account,
      force?: boolean,
      abortSignal?: AbortSignal
    ) => {
      try {
        abortSignal?.throwIfAborted();

        setClaimInfo(null);
        setCheckingEligibility(true);

        abortSignal?.throwIfAborted();

        const claimInfo = await getClaimsInfo(activeAccount.address, {
          force,
        });

        abortSignal?.throwIfAborted();

        // If claimInfo is null, then we know that the user is not eligible
        setClaimInfo(claimInfo ? claimInfo : false);
      } catch (error) {
        // Check if the error is due to abort
        const isAbortError =
          error instanceof DOMException && error.name === 'AbortError';

        // Only show error if it is not due to abort
        // and the abort signal is not aborted
        if (!isAbortError && !abortSignal?.aborted) {
          console.log(error);
          notificationApi({
            message:
              typeof error === 'string'
                ? `Error: ${error}`
                : error instanceof Error
                ? error.message
                : 'Failed to check eligibility',
            variant: 'error',
          });
        }
      } finally {
        setCheckingEligibility(false);
      }
    },
    [notificationApi]
  );

  useEffect(() => {
    if (!activeAccount) return;

    const abortController = new AbortController();

    checkEligibility(activeAccount, undefined, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [activeAccount, checkEligibility]);

  return (
    <AppTemplate.Content>
      <AppTemplate.Title
        title={title}
        subTitle={subTitle}
        overrideSubTitleProps={{
          className: 'text-blue-70 dark:text-blue-50',
        }}
      />

      <AppTemplate.DescriptionContainer>
        <AppTemplate.Description
          variant="mkt-body2"
          className="text-mono-140 dark:text-mono-80"
        >
          {claimInfo === null ? (
            <>
              As part of {"Tangle's"} initial launch, the Tangle Network is
              distributing 5,000,000 TNT tokens to the community. Check
              eligibility below to see if you qualify for TNT Airdrop!
            </>
          ) : claimInfo ? (
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
                  toggleModal(true, PresetTypedChainId.TangleTestnetNative)
                }
              >
                Connect Substrate Wallet
              </Button>
            </div>
          </>
        ) : claimInfo ? (
          <EligibleSection {...claimInfo} />
        ) : claimInfo === false ? (
          <NotEligibleSection checkEligibility={checkEligibility} />
        ) : checkingEligibility ? (
          <>
            <Typography variant="mkt-body2" ta="center" fw="bold">
              Checking eligibility...
            </Typography>

            <Spinner size="lg" className="mx-auto" />
          </>
        ) : null}
      </AppTemplate.Body>
    </AppTemplate.Content>
  );
}

const eligibilityCache = new Map<string, ClaimInfoType>();

const getClaimsInfo = async (
  accountAddress: string,
  options?: { force?: boolean }
): Promise<ClaimInfoType | null> => {
  // Check cache
  const cached = eligibilityCache.get(accountAddress);
  if (cached && !options?.force) {
    return cached;
  }

  const api = await getPolkadotApiPromise();
  if (!api) {
    throw WebbError.from(WebbErrorCodes.ApiNotReady);
  }

  if (!('claims' in api.query)) {
    throw WebbError.from(WebbErrorCodes.NoClaimsPalletFound);
  }

  const params = isEthereumAddress(accountAddress)
    ? { EVM: accountAddress }
    : { Native: accountAddress };

  const decimals = api.registry.chainDecimals[0];
  const tokenSymbol = api.registry.chainTokens[0];

  const [claimAmount, statement] = await api.queryMulti<
    [Option<u128>, Option<PalletAirdropClaimsStatementKind>]
  >([
    [api.query.claims.claims, params], // Claim amount
    [api.query.claims.signing, params], // Claim statement
  ]);

  if (claimAmount.isNone || statement.isNone) {
    return null;
  }

  const result = {
    amount: formatBalance(claimAmount.unwrap(), {
      decimals,
      withUnit: tokenSymbol,
    }),
    isRegularStatement: statement.unwrap().isRegular,
  } satisfies ClaimInfoType;

  // Cache result
  eligibilityCache.set(accountAddress, result);

  return result;
};
