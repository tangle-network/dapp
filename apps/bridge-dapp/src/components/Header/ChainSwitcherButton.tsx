import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { currenciesConfig } from '@webb-tools/dapp-config';
import { ChainIcon } from '@webb-tools/icons';
import {
  ChainListCard,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { ChainType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import cx from 'classnames';
import { FC, useEffect, useMemo } from 'react';
import { WalletModal } from './WalletModal';
import { HeaderButton } from './HeaderButton';
import { calculateTypedChainId } from '@webb-tools/sdk-core';

/**
 * The ChainSwitcherButton defines the clickable button in the Header,
 * as well as the displayable component passed to the WebbUI's special "customMainComponent"
 */
export const ChainSwitcherButton: FC = () => {
  const { chains, activeChain, activeWallet, switchChain } = useWebContext();
  const { setMainComponent } = useWebbUI();

  const sourceChains: ChainType[] = useMemo(() => {
    return Object.values(chains).map((val) => {
      return {
        name: val.name,
        symbol: currenciesConfig[val.nativeCurrencyId].symbol,
      };
    });
  }, [chains]);

  // useEffect(() => {
  //   console.log(activeChain);
  // });

  return (
    <HeaderButton
      className={cx(
        'flex items-center space-x-1 py-2 pr-2 pl-4',
        'border !border-mono-60 rounded-lg'
      )}
      onClick={() =>
        setMainComponent(
          <ChainListCard
            className="w-[550px] h-[700px]"
            overrideScrollAreaProps={{ className: 'h-[550px]' }}
            chainType="source"
            chains={sourceChains}
            currentActiveChain={activeChain?.name}
            value={{
              name: activeChain?.name ?? 'Select chain',
              symbol: activeChain?.name ?? '',
            }}
            onClose={() => setMainComponent(undefined)}
            onChange={async (selectedChain) => {
              const chain = Object.values(chains).find(
                (val) => val.name === selectedChain.name
              );

              if (!chain) {
                throw new Error('Detect unsupported chain is being selected');
              }

              const isSupported =
                activeWallet &&
                activeWallet.supportedChainIds.includes(
                  calculateTypedChainId(chain.chainType, chain.chainId)
                );

              // If the selected chain is supported by the active wallet
              if (isSupported) {
                await switchChain(chain, activeWallet);
                setMainComponent(undefined);
                return;
              }

              setMainComponent(
                <WalletModal chain={chain} sourceChains={sourceChains} />
              );
            }}
          />
        )
      }
    >
      <ChainIcon size="lg" name={activeChain?.name ?? ''} />

      <Typography variant="body1" fw="bold">
        {activeChain?.name}
      </Typography>

      <ChevronDownIcon />
    </HeaderButton>
  );
};
