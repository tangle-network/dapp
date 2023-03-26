import { Transition } from '@headlessui/react';
import cx from 'classnames';
import { useObservableState } from 'observable-hooks';
import { map } from 'rxjs';

import ChainDropdown from '../components/ChainDropdown';
import ContractAddressInput from '../components/ContractAddressInput';
import TokenDropdown from '../components/TokenDropdown';
import TwitterLink from '../components/TwitterLink';
import { useFaucetContext } from '../provider';

const InputsContainer = () => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-stretch gap-2 input-height">
          <ChainDropdown />
          <TokenDropdown />
        </div>
        <Info />
      </div>

      {/** Contract address input */}
      <div className="space-y-4">
        <label className="link !font-bold !text-mono-200">
          Network Contract Address:
        </label>

        <ContractAddressInput />
      </div>
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
      <p className="mt-2 font-satoshi-var info">
        *Please follow <TwitterLink className="info !text-blue-70" />{' '}
        {' on Twitter and login to get started.'}
      </p>
    </Transition>
  );
};

export default InputsContainer;
