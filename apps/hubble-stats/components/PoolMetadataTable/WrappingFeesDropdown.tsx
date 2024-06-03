import { FC } from 'react';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ChainIcon, ChevronDown } from '@webb-tools/icons';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';

import { WrappingFeesByChainType } from './types';
import {
  getShortenChainName,
  getRoundedDownNumberWith2Decimals,
} from '../../utils';

const WrappingFeesDropdown: FC<{
  feesByChain: WrappingFeesByChainType;
}> = ({ feesByChain }) => {
  return (
    <div className="flex items-center justify-center">
      <Dropdown>
        <DropdownBasicButton className="group">
          <div className="flex items-center gap-1">
            <Typography
              variant="body1"
              ta="center"
              className="text-mono-140 dark:text-mono-40"
            >
              View by Network
            </Typography>
            <ChevronDown className="!fill-current transition-transform duration-300 ease-in-out group-radix-state-open:rotate-180" />
          </div>
        </DropdownBasicButton>

        <DropdownBody
          className="overflow-hidden overflow-y-auto bg-mono-0 dark:bg-mono-180 max-h-[180px]"
          size="sm"
        >
          {Object.keys(feesByChain).map((typedChainId) => (
            <div
              key={typedChainId}
              className="flex items-center gap-2 px-4 py-2"
            >
              <ChainIcon name={chainsConfig[+typedChainId].name} size="lg" />
              <Typography
                variant="body1"
                ta="center"
                className="text-mono-140 dark:text-mono-0"
              >
                {getShortenChainName(+typedChainId)}:{' '}
                {feesByChain[+typedChainId] !== undefined
                  ? `${getRoundedDownNumberWith2Decimals(
                      feesByChain[+typedChainId],
                    )}%`
                  : '-'}
              </Typography>
            </div>
          ))}
        </DropdownBody>
      </Dropdown>
    </div>
  );
};

export default WrappingFeesDropdown;
