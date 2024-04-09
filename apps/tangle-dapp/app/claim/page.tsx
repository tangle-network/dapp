'use client';

import { BN_ZERO } from '@polkadot/util';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { Spinner } from '@webb-tools/icons';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useEffect, useMemo, useState } from 'react';
import { combineLatest, Subscription } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import { getPolkadotApiRx } from '../../utils/polkadot';
import EligibleSection from './EligibleSection';
import NotEligibleSection from './NotEligibleSection';
import type { ClaimInfoType } from './types';

export default function ClaimPage() {
  const { toggleModal, isWalletConnected } = useConnectWallet();
  const { activeAccount, loading, isConnecting } = useWebContext();
  const { notificationApi } = useWebbUI();
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();

  // Default to null to indicate that we are still checking
  // If false, then we know that the user is not eligible
  // Otherwise, the state will be the claim info.
  const [claimInfo, setClaimInfo] = useState<ClaimInfoType | false | null>(
    null
  );
  const [isClaiming, setIsClaiming] = useState(false);

  const { title, subTitle } = useMemo(() => {
    if (claimInfo === null) {
      return {
        title: `Claim your $TNT airdrop`,
        subTitle: 'CLAIM AIRDROP',
      };
    }

    if (claimInfo || isClaiming) {
      return {
        title: `You have unclaimed $TNT airdrop!`,
        subTitle: 'GREAT NEWS!',
      };
    }

    return {
      title: `You are not eligible for $TNT airdrop`,
      subTitle: 'OOPS!',
    };
  }, [claimInfo, isClaiming]);

  useEffect(() => {
    if (!activeAccount) return;

    let isMounted = true;
    let sub: Subscription | null = null;
    const accountAddress = activeAccount.address;

    const fetchClaimData = async () => {
      try {
        const apiRx = await getPolkadotApiRx(rpcEndpoint);

        const params = isEthereumAddress(accountAddress)
          ? { EVM: accountAddress }
          : { Native: accountAddress };

        sub = combineLatest([
          apiRx.query.claims.claims(params),
          apiRx.query.claims.signing(params),
          apiRx.query.claims.vesting(params),
        ]).subscribe(([claimAmount, statement, vestingInfo]) => {
          if (claimAmount.isNone || statement.isNone) {
            setClaimInfo(false);
            return;
          }

          if (isMounted) {
            const totalClaim = claimAmount.unwrap();
            let vestingAmount = BN_ZERO;

            if (vestingInfo.isSome) {
              vestingAmount = vestingInfo
                .unwrap()
                .reduce((acc, item) => acc.add(item[0]), BN_ZERO);
            }

            const claimResult: ClaimInfoType = {
              isRegularStatement: statement.unwrap().isRegular,
              totalAmount: totalClaim,
              vestingAmount,
            };
            setClaimInfo(claimResult);
          }
        });
      } catch (error) {
        if (isMounted) {
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
      }
    };

    fetchClaimData();

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, [activeAccount, rpcEndpoint, nativeTokenSymbol, notificationApi]);

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
              distributing 5 million TNT tokens to the community. Check
              eligibility below to see if you qualify for TNT airdrop!
            </>
          ) : claimInfo || isClaiming ? (
            <>
              You are eligible for $TNT airdrop! View your tokens below, and
              start the claiming process.
            </>
          ) : (
            <>
              You are not eligible for $TNT airdrop. You can still participate
              in the Tangle Network by acquiring $TNT or you can try again with
              a different account by disconnecting your current wallet.
            </>
          )}
        </AppTemplate.Description>
      </AppTemplate.DescriptionContainer>

      <AppTemplate.Body>
        {/* Wallet not connected */}
        {!isWalletConnected && (
          <>
            <Typography variant="mkt-body2" ta="center" fw="bold">
              Connect your EVM or Substrate wallet to check eligibility:
            </Typography>

            <div className="space-y-2">
              <Button
                isFullWidth
                isDisabled={loading || isConnecting}
                onClick={() =>
                  toggleModal(true, PresetTypedChainId.TangleTestnetEVM)
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
        )}

        {isWalletConnected && claimInfo === null && (
          <>
            <Typography variant="h5" ta="center" fw="bold">
              Checking eligibility
            </Typography>

            <Spinner size="xl" className="mx-auto" />
          </>
        )}

        {isWalletConnected && isClaiming && (
          <>
            <Typography variant="h5" ta="center" fw="bold">
              Claiming
            </Typography>

            <Spinner size="xl" className="mx-auto" />
          </>
        )}

        {/* Eligible */}
        {isWalletConnected && !isClaiming && claimInfo && (
          <EligibleSection
            claimInfo={claimInfo}
            setIsClaiming={setIsClaiming}
          />
        )}

        {/* Not Eligible */}
        {isWalletConnected && !isClaiming && claimInfo === false && (
          <NotEligibleSection />
        )}
      </AppTemplate.Body>
    </AppTemplate.Content>
  );
}
