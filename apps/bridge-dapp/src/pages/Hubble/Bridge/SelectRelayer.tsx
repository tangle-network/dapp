import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import WalletFillIcon from '@webb-tools/icons/WalletFillIcon';
import { useRelayers } from '@webb-tools/react-hooks';
import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { RelayerListCard } from '@webb-tools/webb-ui-components/components/ListCard';
import { RelayerType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import ToggleCard from '@webb-tools/webb-ui-components/components/ToggleCard';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import cx from 'classnames';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import SlideAnimation from '../../../components/SlideAnimation';
import {
  BRIDGE_PATH,
  DEST_CHAIN_KEY,
  NO_RELAYER,
  POOL_KEY,
  RELAYER_ENDPOINT_KEY,
  SELECT_SOURCE_CHAIN_PATH,
} from '../../../constants';
import { useConnectWallet } from '../../../hooks/useConnectWallet';
import useNavigateWithPersistParams from '../../../hooks/useNavigateWithPersistParams';
import useStateWithRoute from '../../../hooks/useStateWithRoute';

const SelectRelayer = () => {
  const { pathname } = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const { apiConfig, loading, isConnecting, activeApi } = useWebContext();

  const navigate = useNavigateWithPersistParams();

  const { toggleModal } = useConnectWallet();

  const [noRelayer, setNoRelayer] = useStateWithRoute(NO_RELAYER);

  const [destTypedChainId, poolId] = useMemo(() => {
    const typedChainId = searchParams.get(DEST_CHAIN_KEY) ?? '';

    const poolId = searchParams.get(POOL_KEY) ?? '';

    return [
      Number.isNaN(parseInt(typedChainId)) ? undefined : parseInt(typedChainId),
      Number.isNaN(parseInt(poolId)) ? undefined : parseInt(poolId),
    ];
  }, [searchParams]);

  const useRelayersArgs = useMemo(
    () => ({
      typedChainId: destTypedChainId ?? undefined,
      target:
        typeof poolId === 'number' && typeof destTypedChainId === 'number'
          ? apiConfig.anchors[poolId]?.[destTypedChainId]
          : undefined,
    }),
    [apiConfig.anchors, destTypedChainId, poolId]
  );

  // Given the user inputs above, fetch relayers state
  const {
    relayersState: { relayers, activeRelayer },
    setRelayer,
  } = useRelayers(useRelayersArgs);

  const destChainCfg = useMemo(() => {
    if (typeof destTypedChainId !== 'number') {
      return;
    }

    return apiConfig.chains[destTypedChainId];
  }, [apiConfig.chains, destTypedChainId]);

  const relayersForDisplay = useMemo<Array<RelayerType>>(() => {
    if (!destChainCfg) {
      return [];
    }

    return relayers
      .map((relayer) => {
        const relayerData = relayer.capabilities.supportedChains[
          destChainCfg.chainType === ChainType.EVM ? 'evm' : 'substrate'
        ].get(calculateTypedChainId(destChainCfg.chainType, destChainCfg.id));

        if (!relayerData?.beneficiary) {
          return undefined;
        }

        const theme: RelayerType['theme'] =
          destChainCfg.chainType === ChainType.EVM ? 'ethereum' : 'substrate';

        const r: RelayerType = {
          address: relayerData.beneficiary,
          name: new URL(relayer.endpoint).host,
          externalUrl: relayer.infoUri,
          theme,
        };

        return r;
      })
      .filter((r): r is RelayerType => r !== undefined);
  }, [destChainCfg, relayers]);

  const selectedRelayer = useMemo<RelayerType | undefined>(() => {
    return activeRelayer?.beneficiary && destChainCfg
      ? ({
          address: activeRelayer.beneficiary,
          externalUrl: activeRelayer.infoUri,
          theme:
            destChainCfg.chainType === ChainType.EVM ? 'ethereum' : 'substrate',
        } satisfies RelayerType)
      : undefined;
  }, [activeRelayer?.beneficiary, activeRelayer?.infoUri, destChainCfg]);

  const isDisconnected = useMemo(
    () => !loading && !isConnecting && !activeApi?.relayerManager,
    [activeApi?.relayerManager, isConnecting, loading]
  );

  const handleClose = useCallback(() => {
    navigate(pathname.split('/').slice(0, -1).join('/'));
  }, [navigate, pathname]);

  const handleRelayerChange = useCallback(
    (nextRelayer_: RelayerType) => {
      const nextRelayer =
        relayers.find((relayer) => {
          return relayer.infoUri === nextRelayer_.externalUrl;
        }) ?? null;

      // Next relayer is null or equal to active relayer
      if (nextRelayer && nextRelayer.endpoint !== activeRelayer?.endpoint) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set(RELAYER_ENDPOINT_KEY, nextRelayer.endpoint);
          return next;
        });
        setRelayer(nextRelayer);
      } else {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.delete(RELAYER_ENDPOINT_KEY);
          return next;
        });
        setRelayer(null);
      }

      handleClose();
    },
    [activeRelayer?.endpoint, handleClose, relayers, setRelayer, setSearchParams] // prettier-ignore
  );

  const handleConnectWallet = useCallback(() => {
    if (destChainCfg) {
      toggleModal(
        true,
        Object.values(chainsPopulated).find(
          (chain) =>
            chain.chainType === destChainCfg.chainType &&
            chain.id === destChainCfg.id
        )
      );
    } else {
      navigate(`/${BRIDGE_PATH}/${SELECT_SOURCE_CHAIN_PATH}`);
    }
  }, [destChainCfg, navigate, toggleModal]);

  // Set relayer endpoint in search params on mount
  useEffect(() => {
    setSearchParams((prev) => {
      if (!activeRelayer || prev.has(RELAYER_ENDPOINT_KEY)) {
        return prev;
      }

      const next = new URLSearchParams(prev);
      next.set(RELAYER_ENDPOINT_KEY, activeRelayer.endpoint);
      return next;
    });
  }, [activeRelayer, setSearchParams]);

  const relayerBtnText = useMemo(() => {
    if (noRelayer) {
      return 'No relayer';
    } else {
      return 'Use selected relayer';
    }
  }, [noRelayer]);

  return (
    <SlideAnimation className="flex items-center justify-center w-full overflow-hidden">
      <RelayerListCard
        isDisconnected={isDisconnected}
        className="h-[var(--card-height)]"
        value={selectedRelayer}
        relayers={relayersForDisplay}
        onClose={() => handleClose()}
        onChange={handleRelayerChange}
        onConnectWallet={handleConnectWallet}
        Footer={
          <div className="mt-4 space-y-4">
            <ToggleCard
              className={cx('max-w-none', { hidden: isDisconnected })}
              Icon={<WalletFillIcon size="lg" />}
              switcherProps={{
                checked: !!noRelayer,
                onCheckedChange: (checked) => setNoRelayer(checked ? '1' : ''),
              }}
              title="No relayer (not recommended)"
              info="For maximum privacy it is recommended to make use of a relayer to perform the transaction. The relayer will be the one to submit the transaction to the chain and send the funds to the recipient address."
            />

            <Button isFullWidth className={cx({ hidden: isDisconnected })}>
              {relayerBtnText}
            </Button>
          </div>
        }
      />
    </SlideAnimation>
  );
};

export default SelectRelayer;
