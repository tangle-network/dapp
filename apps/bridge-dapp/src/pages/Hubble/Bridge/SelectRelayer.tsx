import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import isValidUrl from '@webb-tools/dapp-types/utils/isValidUrl';
import { Search } from '@webb-tools/icons/Search';
import { Spinner } from '@webb-tools/icons/Spinner';
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
import IconButton from '@webb-tools/webb-ui-components/components/buttons/IconButton';
import cx from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BooleanParam, NumberParam, useQueryParams } from 'use-query-params';
import SlideAnimation from '../../../components/SlideAnimation';
import {
  BRIDGE_PATH,
  NO_RELAYER_KEY,
  POOL_KEY,
  SELECT_SOURCE_CHAIN_PATH,
  SOURCE_CHAIN_KEY,
} from '../../../constants';
import { useConnectWallet } from '../../../hooks/useConnectWallet';
import useNavigateWithPersistParams from '../../../hooks/useNavigateWithPersistParams';
import { useRelayerManager } from '../../../hooks/useRelayerManager';

const SelectRelayer = () => {
  const { pathname } = useLocation();

  const { apiConfig, loading, isConnecting, activeApi } = useWebContext();

  const navigate = useNavigateWithPersistParams();

  const { toggleModal } = useConnectWallet();

  const [customRelayer, setCustomRelayer] = useState('');
  const [customerRelayerError, setCustomerRelayerError] = useState('');
  const [customRelayerLoading, setCustomRelayerLoading] = useState(false);

  const [query, setQuery] = useQueryParams({
    [NO_RELAYER_KEY]: BooleanParam,
    [SOURCE_CHAIN_KEY]: NumberParam,
    [POOL_KEY]: NumberParam,
  });

  const {
    [NO_RELAYER_KEY]: noRelayer,
    [SOURCE_CHAIN_KEY]: typedChainId,
    [POOL_KEY]: poolId,
  } = query;

  const useRelayersArgs = useMemo(
    () => ({
      typedChainId: typedChainId ?? undefined,
      target:
        typeof poolId === 'number' && typeof typedChainId === 'number'
          ? apiConfig.anchors[poolId]?.[typedChainId]
          : undefined,
    }),
    [apiConfig.anchors, typedChainId, poolId]
  );

  // Given the user inputs above, fetch relayers state
  const {
    relayersState: { relayers, activeRelayer },
    setRelayer,
  } = useRelayers(useRelayersArgs);

  const { getInfo, addRelayer } = useRelayerManager();

  const chainCfg = useMemo(() => {
    if (typeof typedChainId !== 'number') {
      return;
    }

    return apiConfig.chains[typedChainId];
  }, [apiConfig.chains, typedChainId]);

  const relayersForDisplay = useMemo<Array<RelayerType>>(() => {
    if (!chainCfg) {
      return [];
    }

    return relayers
      .map((relayer) => {
        const relayerData = relayer.capabilities.supportedChains[
          chainCfg.chainType === ChainType.EVM ? 'evm' : 'substrate'
        ].get(calculateTypedChainId(chainCfg.chainType, chainCfg.id));

        if (!relayerData?.beneficiary) {
          return undefined;
        }

        const theme: RelayerType['theme'] =
          chainCfg.chainType === ChainType.EVM ? 'ethereum' : 'substrate';

        const r: RelayerType = {
          address: relayerData.beneficiary,
          name: new URL(relayer.endpoint).host,
          externalUrl: relayer.infoUri,
          theme,
          isDisabled: Boolean(noRelayer),
        };

        return r;
      })
      .filter((r): r is RelayerType => r !== undefined);
  }, [noRelayer, chainCfg, relayers]);

  const selectedRelayer = useMemo<RelayerType | undefined>(() => {
    return activeRelayer?.beneficiary && chainCfg
      ? ({
          address: activeRelayer.beneficiary,
          externalUrl: activeRelayer.infoUri,
          theme:
            chainCfg.chainType === ChainType.EVM ? 'ethereum' : 'substrate',
        } satisfies RelayerType)
      : undefined;
  }, [activeRelayer?.beneficiary, activeRelayer?.infoUri, chainCfg]);

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
        setRelayer(nextRelayer);
      } else {
        setRelayer(null);
      }
    },
    [relayers, activeRelayer, setRelayer]
  );

  const handleConnectWallet = useCallback(() => {
    if (chainCfg) {
      toggleModal(true, calculateTypedChainId(chainCfg.chainType, chainCfg.id));
    } else {
      navigate(`/${BRIDGE_PATH}/${SELECT_SOURCE_CHAIN_PATH}`);
    }
  }, [chainCfg, navigate, toggleModal]);

  const testAndAddCustomRelayer = useCallback(async () => {
    if (!customRelayer) {
      return;
    }

    const error = 'Invalid input. Pleas check your search and try again.';
    if (!isValidUrl(customRelayer)) {
      setCustomerRelayerError(error);
      return;
    }

    const relayer = relayers.find((r) => r.endpoint === customRelayer);
    if (relayer) {
      return; // If relayer already exists, do nothing
    }

    setCustomRelayerLoading(true);
    const info = await getInfo(customRelayer);
    if (!info) {
      setCustomerRelayerError(error);
    } else {
      await addRelayer(customRelayer);
      setCustomerRelayerError('');
    }

    setCustomRelayerLoading(false);
  }, [addRelayer, customRelayer, getInfo, relayers]);

  const handleCustomRelayerChange = useCallback((nextRelayer: string) => {
    setCustomRelayer(nextRelayer);
    setCustomerRelayerError('');
  }, []);

  const toggleNoRelayer = useCallback(
    (nextChecked: boolean) => {
      if (!nextChecked) {
        setQuery({ [NO_RELAYER_KEY]: undefined });
        return;
      }

      // If no relayer is selected, set the active relayer to null
      setQuery({ [NO_RELAYER_KEY]: nextChecked });
      setRelayer(null);
    },
    [setQuery, setRelayer]
  );

  const isDisabled = useMemo(() => {
    if (relayersForDisplay.length === 0 && !noRelayer) {
      return true;
    }

    if (relayersForDisplay.length > 0 && !selectedRelayer && !noRelayer) {
      return true;
    }

    return false;
  }, [relayersForDisplay.length, noRelayer, selectedRelayer]);

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
        onClose={handleClose}
        onChange={handleRelayerChange}
        onConnectWallet={handleConnectWallet}
        overrideInputProps={{
          rightIcon: (
            <IconButton
              disabled={customRelayerLoading}
              onClick={() => testAndAddCustomRelayer()}
            >
              {customRelayerLoading ? <Spinner /> : <Search />}
            </IconButton>
          ),
          value: customRelayer,
          onChange: handleCustomRelayerChange,
          errorMessage: customerRelayerError,
        }}
        Footer={
          <div className="mt-4 space-y-4">
            <ToggleCard
              className={cx('max-w-none', { hidden: isDisconnected })}
              Icon={<WalletFillIcon size="lg" />}
              switcherProps={{
                checked: Boolean(noRelayer),
                onCheckedChange: toggleNoRelayer,
              }}
              title="No relayer (not recommended)"
              info="For maximum privacy it is recommended to make use of a relayer to perform the transaction. The relayer will be the one to submit the transaction to the chain and send the funds to the recipient address."
            />

            <Button
              isFullWidth
              isDisabled={isDisabled}
              className={cx({ hidden: isDisconnected })}
              onClick={handleClose}
            >
              {relayerBtnText}
            </Button>
          </div>
        }
      />
    </SlideAnimation>
  );
};

export default SelectRelayer;
