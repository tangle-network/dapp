import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { useRelayers } from '@webb-tools/react-hooks';
import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { RelayerListCard } from '@webb-tools/webb-ui-components';
import { RelayerType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import SlideAnimation from '../../../components/SlideAnimation';
import {
  DEST_CHAIN_KEY,
  POOL_KEY,
  RELAYER_ENDPOINT_KEY,
} from '../../../constants';
import useNavigateWithPersistParams from '../../../hooks/useNavigateWithPersistParams';

const SelectRelayer = () => {
  const { pathname } = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const { apiConfig } = useWebContext();

  const navigate = useNavigateWithPersistParams();

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

  const handleClose = useCallback(() => {
    navigate(pathname.split('/').slice(0, -1).join('/'));
  }, [navigate, pathname]);

  const handleRelayerChange = useCallback(
    (nextRelayer_: RelayerType) => {
      const nextRelayer =
        relayers.find((relayer) => {
          return relayer.infoUri === nextRelayer_.externalUrl;
        }) ?? null;

      setRelayer(nextRelayer);

      const nextSearchParams = new URLSearchParams(searchParams);

      if (nextRelayer) {
        nextSearchParams.set(RELAYER_ENDPOINT_KEY, nextRelayer.endpoint);
      } else {
        nextSearchParams.delete(RELAYER_ENDPOINT_KEY);
      }

      handleClose();
    },
    [handleClose, relayers, searchParams, setRelayer]
  );

  // Set relayer endpoint in search params
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

  return (
    <SlideAnimation className="flex items-center justify-center w-full overflow-hidden">
      <RelayerListCard
        className="h-[var(--card-height)]"
        value={selectedRelayer}
        relayers={relayersForDisplay}
        onClose={() => handleClose()}
        onChange={handleRelayerChange}
      />
    </SlideAnimation>
  );
};

export default SelectRelayer;
