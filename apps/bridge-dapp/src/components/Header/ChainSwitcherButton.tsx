import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { currenciesConfig } from '@webb-tools/dapp-config';
import { ChainIcon, TokenIcon } from '@webb-tools/icons';
import {
  ChainListCard,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { ChainType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import cx from 'classnames';
import { FC, useMemo } from 'react';
import { WalletModal } from './WalletModal';
import { HeaderButton } from './HeaderButton';

/**
 * The ChainSwitcherButton defines the clickable button in the Header,
 * as well as the displayable component passed to the WebbUI's special "customMainComponent"
 */
export const ChainSwitcherButton: FC = () => {
  const { chains, activeChain } = useWebContext();
  const { setMainComponent } = useWebbUI();

  const sourceChains: ChainType[] = useMemo(() => {
    return Object.values(chains).map((val) => {
      return {
        name: val.name,
        symbol: currenciesConfig[val.nativeCurrencyId].symbol,
      };
    });
  }, [chains]);

  return (
    <HeaderButton
      className={cx(
        'flex items-center space-x-1 py-2 pr-2 pl-4',
        'border !border-mono-60 rounded-lg'
      )}
      onClick={() =>
        setMainComponent(
          <ChainListCard
            className="w-[550px] h-[720px]"
            chainType="source"
            chains={sourceChains}
            value={{ name: activeChain.name, symbol: activeChain.name }}
            onClose={() => setMainComponent(undefined)}
            onChange={async (selectedChain) => {
              const chain = Object.values(chains).find(
                (val) => val.name === selectedChain.name
              );

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
        {activeChain.name}
      </Typography>

      <ChevronDownIcon />
    </HeaderButton>
  );
};
