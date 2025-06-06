import { BN_ZERO } from '@polkadot/util';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useConnectWallet } from '@tangle-network/api-provider-environment/ConnectWallet';
import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import { PresetTypedChainId } from '@tangle-network/dapp-types/ChainId';
import { Spinner } from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { getApiRx } from '@tangle-network/tangle-shared-ui/utils/polkadot/api';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { AppTemplate } from '@tangle-network/ui-components/containers/AppTemplate';
import { useUIContext } from '@tangle-network/ui-components/hooks/useUIContext';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useEffect, useMemo, useState } from 'react';
import { combineLatest, Subscription } from 'rxjs';

import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import EligibleSection from './EligibleSection';
import NotEligibleSection from './NotEligibleSection';
import type { ClaimInfoType } from './types';

const ClaimPage: FC = () => {
  const { toggleModal, isWalletConnected } = useConnectWallet();
  const { loading, isConnecting } = useWebContext();
  const activeAccountAddress = useActiveAccountAddress();
  const { notificationApi } = useUIContext();
  const rpcEndpoints = useNetworkStore((store) => store.network.wsRpcEndpoints);
  const { nativeTokenSymbol } = useNetworkStore();

  // Default to null to indicate that we are still checking
  // If false, then we know that the user is not eligible
  // Otherwise, the state will be the claim info.
  const [claimInfo, setClaimInfo] = useState<ClaimInfoType | false | null>(
    null,
  );
  const [isClaiming, setIsClaiming] = useState(false);

  const { title, subTitle } = useMemo(() => {
    if (claimInfo === null) {
      return {
        title: 'Check Eligibility',
        subTitle: 'CLAIM AIRDROP',
      };
    }

    if (claimInfo || isClaiming) {
      return {
        title: 'Airdrop Available',
        subTitle: 'CONGRATULATIONS!',
      };
    }

    return {
      title: 'Not Eligible',
      subTitle: 'OOPS!',
    };
  }, [claimInfo, isClaiming]);

  useEffect(() => {
    if (activeAccountAddress === null) {
      return;
    }

    let isMounted = true;
    let sub: Subscription | null = null;
    const accountAddress = activeAccountAddress;

    const fetchClaimData = async () => {
      try {
        const apiRx = await getApiRx(rpcEndpoints);

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
  }, [activeAccountAddress, rpcEndpoints, nativeTokenSymbol, notificationApi]);

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
              As part of {"Tangle's"} initial launch, the Tangle network is
              distributing 5 million TNT tokens to the community. Check
              eligibility below to see if your account qualifies for the TNT
              airdrop!
            </>
          ) : claimInfo || isClaiming ? (
            <>
              This account is eligible for the $TNT airdrop! Review details
              below, and start the claiming process.
            </>
          ) : (
            <>
              This account is not eligible for the $TNT airdrop. You can still
              participate in the Tangle network by acquiring $TNT or try again
              with a different account by disconnecting your current wallet.
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
};

export default ClaimPage;
