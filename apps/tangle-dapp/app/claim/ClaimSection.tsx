'use client';

import { Option, u128 } from '@polkadot/types';
import { PalletAirdropClaimsStatementKind } from '@polkadot/types/lookup';
import { formatBalance } from '@polkadot/util';
import { isEthereumAddress } from '@polkadot/util-crypto';
import type { Account } from '@webb-tools/abstract-api-provider';
import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
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
import SucessClaim from './SucessClaim';
import type { ClaimInfoType } from './types';

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

function ClaimSection() {
  const { toggleModal, isWalletConnected } = useConnectWallet();
  const { apiConfig, activeAccount, loading, isConnecting } = useWebContext();
  const { notificationApi } = useWebbUI();

  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const [successBlockHash, setSuccessBlockHash] = useState('');

  // Default to null to indicate that we are still checking
  // If false, then we know that the user is not eligible
  // Otherwise, the state will be the claim info
  const [claimInfo, setClaimInfo] =
    useState<Nullable<ClaimInfoType | false>>(null);

  const checkEligibility = useCallback(
    async (activeAccount: Account, force?: boolean) => {
      try {
        setClaimInfo(null);
        setSuccessBlockHash('');
        setCheckingEligibility(true);

        const claimInfo = await getClaimsInfo(activeAccount.address, {
          force,
        });

        setClaimInfo(
          claimInfo ? claimInfo : false // If claimInfo is null, then we know that the user is not eligible
        );
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

  const txExplorerUrl = useMemo(() => {
    if (!successBlockHash) return null;

    const explorer =
      apiConfig.chains[PresetTypedChainId.TangleStandaloneTestnet]
        ?.blockExplorers?.default?.url;

    if (!explorer) return null;

    return getExplorerURI(explorer, successBlockHash, 'tx', 'polkadot');
  }, [apiConfig.chains, successBlockHash]);

  useEffect(() => {
    if (!activeAccount) return;

    checkEligibility(activeAccount);
  }, [isWalletConnected, activeAccount, notificationApi, checkEligibility]);

  return (
    <AppTemplate.Content>
      <AppTemplate.Title
        title={
          claimInfo === null
            ? 'Claim your $TNT Aidrop'
            : claimInfo
            ? successBlockHash
              ? 'You have successfully claimed $TNT Airdrop!'
              : 'You have unclaimed $TNT Airdrop!'
            : 'You are not eligible for $TNT Airdrop'
        }
        subTitle={
          successBlockHash
            ? 'CONGRATULATIONS!'
            : claimInfo === null
            ? 'CLAIM AIRDROP'
            : claimInfo
            ? successBlockHash
              ? 'CONGRATULATIONS!'
              : 'GREATE NEWS!'
            : 'OOPS!'
        }
        overrideSubTitleProps={{
          className: 'text-blue-70 dark:text-blue-50',
        }}
      />

      {!successBlockHash ? (
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
                participate in the Tangle Network by purchasing $TNT or try
                again with a different account.
              </>
            )}
          </AppTemplate.Description>
        </AppTemplate.DescriptionContainer>
      ) : null}

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
        ) : claimInfo ? (
          successBlockHash ? (
            <SucessClaim
              successBlockHash={successBlockHash}
              txExplorerUrl={txExplorerUrl}
            />
          ) : (
            <EligibleSection
              {...claimInfo}
              onSuccess={(blockHash) => setSuccessBlockHash(blockHash)}
            />
          )
        ) : claimInfo === false ? (
          <NotEligibleSection checkEligibility={checkEligibility} />
        ) : null}
      </AppTemplate.Body>
    </AppTemplate.Content>
  );
}

export default ClaimSection;
