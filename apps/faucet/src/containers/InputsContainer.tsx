import { Transition } from '@headlessui/react';
import { Chip, Typography } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import cx from 'classnames';
import { useObservableState } from 'observable-hooks';
import { forwardRef } from 'react';
import { map } from 'rxjs';
import { twMerge } from 'tailwind-merge';

import ChainDropdown from '../components/ChainDropdown';
import ContractAddressInput from '../components/ContractAddressInput';
import RecipientAddressInput from '../components/RecipientAddressInput';
import TokenDropdown from '../components/TokenDropdown';
import TwitterLink from '../components/TwitterLink';
import { useFaucetContext } from '../provider';
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
          <Info />
        </div>

        {/** Contract address input */}
        <InputWrapper title="Network Contract Address:">
          <ContractAddressInput />
        </InputWrapper>

        {/** Recipient address input */}
        <InputWrapper title="Recipient Address:">
          <RecipientAddressInput />
        </InputWrapper>

        {/** Amount */}
        <div className="flex items-center justify-between">
          <Label className="mb-0">Amount:</Label>

          <AmountChip />
        </div>
      </div>

      <MintButtonContainer />
    </div>
  );
};

const AmountChip = () => {
  const { amount, inputValues$, twitterHandle$ } = useFaucetContext();

  const token = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.token))
  );

  const twitterHandle = useObservableState(twitterHandle$);

  return (
    <Chip isDisabled={!twitterHandle} color="blue" className="rounded-lg">
      {amount} {token}
    </Chip>
  );
};

const Label = forwardRef<HTMLLabelElement, PropsOf<'label'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <label
        {...props}
        ref={ref}
        className={twMerge(
          'mkt-caption !font-bold !text-mono-200 mb-4 block',
          className
        )}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

const InputWrapper = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <div>
      <Label className="mkt-caption !font-bold !text-mono-200 mb-4 block">
        {title}
      </Label>

      {children}
    </div>
  );
};

const Info = () => {
  const { twitterHandle$, inputValues$ } = useFaucetContext();

  const twitterHandle = useObservableState(twitterHandle$);
  const selectedChain = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.chain))
  );
  const selectedToken = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.token))
  );

  const isDisplayed = !twitterHandle && !!selectedChain && !!selectedToken;

  return (
    <Transition
      show={isDisplayed}
      enter="transition-opacity duration-150"
      enterFrom={cx('opacity-0 -translate-y-[100%]')}
      enterTo={cx('opacity-100 translate-y-0')}
      leave="transition-opacity duration-150"
      leaveFrom={cx('opacity-100 translate-y-0')}
      leaveTo={cx('opacity-0 -translate-y-[100%]')}
    >
      <Typography variant="mkt-utility" className="mt-2">
        *Please follow <TwitterLink isInheritFont />{' '}
        {' on Twitter and login to get started.'}
      </Typography>
    </Transition>
  );
};

export default InputsContainer;
