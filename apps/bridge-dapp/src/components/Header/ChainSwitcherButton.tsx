import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { ChainIcon } from '@webb-tools/icons';
import { Typography, useWebbUI } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { FC } from 'react';
import { ChainListCardWrapper } from '../ChainListCardWrapper';
import { HeaderButton } from './HeaderButton';

/**
 * The ChainSwitcherButton defines the clickable button in the Header,
 * as well as the displayable component passed to the WebbUI's special "customMainComponent"
 */
export const ChainSwitcherButton: FC = () => {
  const { activeChain } = useWebContext();
  const { setMainComponent } = useWebbUI();

  return (
    <HeaderButton
      className={cx(
        'flex items-center space-x-1 py-2 pr-2 pl-4',
        'border !border-mono-60 rounded-lg'
      )}
      onClick={() => setMainComponent(<ChainListCardWrapper />)}
    >
      <ChainIcon size="lg" name={activeChain?.name ?? ''} />

      <Typography variant="body1" fw="bold">
        {activeChain?.name}
      </Typography>

      <ChevronDownIcon />
    </HeaderButton>
  );
};
