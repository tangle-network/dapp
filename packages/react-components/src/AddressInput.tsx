import { useAccounts, useAddressValidator } from '@webb-dapp/react-hooks';
import { ArrowIcon, AutoComplete, Input, InputProps } from '@webb-dapp/ui-components';
import clsx from 'clsx';
import React, { FC, useCallback, useMemo, useState } from 'react';

import Identicon from '@polkadot/react-identicon';

import classes from './AddressInput.module.scss';
import { FormatAddress } from './format';

interface AddressInputProps extends Omit<InputProps, 'onChange'> {
  width?: number;
  onChange: (value: { address: string; error?: string }) => void;
  showIdentIcon?: boolean;
  inputClassName?: string;
  blockAddressList?: string[];
}

/**
 * @name AddressInput
 * @description input and auto select account
 */
export const AddressInput: FC<AddressInputProps> = ({
  blockAddressList = [],
  inputClassName,
  onChange,
  showIdentIcon,
  width,
  ...other
}) => {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { addToAddressBook, addressBook } = useAccounts();
  const addressValidator = useAddressValidator({ required: true });

  const options = useMemo(() => {
    return addressBook
      .filter((item) => !blockAddressList.includes(item.address))
      .map((item) => {
        return {
          label: (
            <div className={classes.option}>
              <Identicon className={classes.identicon} size={32} theme='polkadot' value={item.address} />
              <div>
                {item?.name ? <p>{item.name}</p> : null}
                <FormatAddress address={item.address} />
              </div>
            </div>
          ),
          value: item.address,
        };
      });
  }, [addressBook, blockAddressList]);

  const insertOptions = useCallback(
    (value: string) => {
      addToAddressBook({ address: value });
    },
    [addToAddressBook]
  );

  const _setValue = useCallback(
    (value: string): void => {
      setValue(value);

      addressValidator(value)
        .then(() => {
          setError('');
          insertOptions(value);
          onChange({ address: value });
        })
        .catch((e) => {
          setError(e.message);
          onChange({ address: value, error: e.message });
        });
    },
    [setValue, addressValidator, insertOptions, onChange]
  );

  const handleChange = useCallback(
    (value: string) => {
      _setValue(value);
    },
    [_setValue]
  );

  const handleSelect = useCallback(
    (value: string): void => {
      _setValue(value);
    },
    [_setValue]
  );

  return (
    <AutoComplete onChange={handleChange} onSelect={handleSelect} options={options} style={{ width }}>
      <Input
        error={error}
        inputClassName={clsx(classes.input, inputClassName)}
        prefix={
          showIdentIcon && !error ? (
            <Identicon className={classes.icon} size={32} theme='polkadot' value={value} />
          ) : undefined
        }
        suffix={<ArrowIcon />}
        {...other}
      />
    </AutoComplete>
  );
};
