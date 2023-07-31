import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { ExternalLinkLine } from '@webb-tools/icons';
import {
  Button,
  Chip,
  Label,
  shortenHex,
  Typography,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map } from 'rxjs';

import ChainDropdown from '../components/ChainDropdown';
import RecipientAddressInput from '../components/RecipientAddressInput';
import TokenDropdown from '../components/TokenDropdown';
import { useFaucetContext } from '../provider';
import useStore, { StoreKey } from '../store';
import MintButtonContainer from './MintButtonContainer';

const InputsContainer = () => {
  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div>
          <div className="flex items-stretch gap-2 input-height">
            <ChainDropdown />
            <TokenDropdown />
          </div>
        </div>

        {/** Recipient address input */}
        <InputWrapper title="Recipient Address:">
          <RecipientAddressInput />
        </InputWrapper>

        {/** Token Address */}
        <InputWrapper align="horizontal" title="Token Contract Address:">
          <TokenAddressLink />
        </InputWrapper>

        {/** Amount */}
        <InputWrapper title="Amount:" align="horizontal">
          <AmountChip />
        </InputWrapper>
      </div>

      <MintButtonContainer />
    </div>
  );
};

export default InputsContainer;

const InputWrapper = ({
  children,
  title,
  align = 'vertical',
}: {
  children: React.ReactNode;
  title: string;
  align?: 'horizontal' | 'vertical';
}) => {
  return (
    <div
      className={cx('flex', {
        'flex-col space-y-4': align === 'vertical',
        'items-center justify-between': align === 'horizontal',
      })}
    >
      <Label className="block font-black mkt-body2 text-mono-200">
        {title}
      </Label>

      {children}
    </div>
  );
};

const AmountChip = () => {
  const { amount$, inputValues$ } = useFaucetContext();

  const [getStore] = useStore();

  const amount = useObservableState(amount$);

  const token = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.token))
  );

  const twitterHandle = useMemo(() => {
    return getStore(StoreKey.twitterHandle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStore(StoreKey.twitterHandle)]);

  if (Number.isNaN(amount)) {
    return (
      <Typography variant="mkt-body2" className="font-black">
        --
      </Typography>
    );
  }

  return (
    <Chip isDisabled={!twitterHandle} color="blue" className="rounded-lg">
      {amount} {token}
    </Chip>
  );
};

const TokenAddressLink = () => {
  const { inputValues$ } = useFaucetContext();

  const tokenAddress = useObservableState<string | undefined>(
    inputValues$.pipe(map((inputValues) => inputValues.contractAddress))
  );

  const typedChainId = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.chain))
  );

  // Calculate the token explorer link
  const tokenExplorerLink = useMemo(() => {
    if (!tokenAddress || !typedChainId) return '';

    return `${chainsConfig[typedChainId]?.blockExplorers?.default.url}/token/${tokenAddress}`;
  }, [tokenAddress, typedChainId]);

  return tokenAddress && BigInt(tokenAddress) !== ZERO_BIG_INT ? (
    <Button
      variant="link"
      size="sm"
      href={tokenExplorerLink}
      target="_blank"
      className="normal-case"
      rightIcon={<ExternalLinkLine className="!fill-current" />}
    >
      <Typography
        component="span"
        variant="body2"
        className="font-bold text-inherit"
      >
        {shortenHex(tokenAddress)}
      </Typography>
    </Button>
  ) : (
    <Typography variant="mkt-body2" className="font-black">
      --
    </Typography>
  );
};
