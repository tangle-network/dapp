import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
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
  const { amount, inputValues$ } = useFaucetContext();

  const [getStore] = useStore();

  const token = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.token))
  );

  const twitterHandle = useMemo(() => {
    return getStore(StoreKey.twitterHandle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStore(StoreKey.twitterHandle)]);

  return (
    <Chip isDisabled={!twitterHandle} color="blue" className="rounded-lg">
      {amount} {token}
    </Chip>
  );
};

const TokenAddressLink = () => {
  const { inputValues$ } = useFaucetContext();

  const token = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.token))
  );

  const chain = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.chain))
  );

  const explorerLink = useMemo(() => {
    if (!token || !chain) return '';

    const chainConfig = Object.values(chainsConfig).find(
      (config) => config.name === chain
    );

    return chainConfig?.blockExplorerStub ?? '';
  }, [chain, token]);

  // Calculate the token explorer link
  const tokenExplorerLink = useMemo(() => {
    if (!token) return '';

    return `${explorerLink}/token/${token}`;
  }, [explorerLink, token]);

  return token ? (
    <Button variant="link" size="sm" href={tokenExplorerLink} target="_blank">
      {shortenHex(token)}
    </Button>
  ) : (
    <Typography variant="mkt-body2" className="font-black">
      {token || '--'}
    </Typography>
  );
};
