import { BN } from '@polkadot/util';
import {
  GITHUB_BUG_REPORT_URL,
  Modal,
  ModalContent,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useEffect, useMemo } from 'react';

import { LsParachainChainId } from '../../../constants/liquidStaking/liquidStakingParachain';
import { AnySubstrateAddress } from '../../../types/utils';
import formatBn from '../../../utils/formatBn';
import AddressLink from '../AddressLink';
import ChainLogo from './ChainLogo';

export type SelectTokenModalProps = {
  isOpen: boolean;
  options: Omit<TokenListItemProps, 'onClick'>[];
  onTokenSelect: (address: AnySubstrateAddress) => void;
  onClose: () => void;
};

const SelectTokenModal: FC<SelectTokenModalProps> = ({
  isOpen,
  options,
  onTokenSelect,
  onClose,
}) => {
  // Sanity check: Ensure all addresses are unique.
  useEffect(() => {
    const seenAddresses = new Set<AnySubstrateAddress>();

    for (const option of options) {
      if (seenAddresses.has(option.address)) {
        console.warn(
          `Duplicate token address found: ${option.address}, expected all addresses to be unique`,
        );
      }
    }
  }, [options]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className="w-full max-w-[calc(100vw-40px)] md:max-w-[500px]"
      >
        <ModalHeader onClose={onClose}>Select Token</ModalHeader>

        <div className="p-9 space-y-4 max-h-[500px] overflow-y-auto">
          {options.map((option) => {
            return (
              <TokenListItem
                key={option.address}
                {...option}
                onClick={onTokenSelect.bind(null, option.address)}
              />
            );
          })}

          {/* No tokens available */}
          {options.length === 0 && (
            <div>
              <Typography variant="body1" fw="normal" className="text-center">
                No tokens available
              </Typography>

              <Typography variant="body1" fw="normal" className="text-center">
                Think this is a bug?{' '}
                <a className="underline" href={GITHUB_BUG_REPORT_URL}>
                  Report it here
                </a>
              </Typography>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

export type TokenListItemProps = {
  address: AnySubstrateAddress;
  decimals: number;
  amount: BN;
  onClick: () => void;
};

/** @internal */
const TokenListItem: FC<TokenListItemProps> = ({
  address,
  decimals,
  amount,
  onClick,
}) => {
  const formattedAmount = useMemo(() => {
    return formatBn(amount, decimals);
  }, [amount, decimals]);

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between py-2 px-4 rounded-lg cursor-pointer w-full hover:dark:bg-mono-200"
    >
      {/* Information */}
      <div className="flex items-center justify-center gap-2">
        <ChainLogo size="md" isRounded chainId={LsParachainChainId.POLKADOT} />

        <div className="space-y-1">
          <Typography variant="h5" fw="bold" className="dark:text-mono-0">
            tgDOT_A
          </Typography>

          <AddressLink address={address} />
        </div>
      </div>

      {/* Amount */}
      <Typography className="dark:text-mono-0" variant="h5" fw="bold">
        {formattedAmount}
      </Typography>
    </div>
  );
};

export default SelectTokenModal;
