import React, { FC } from 'react';
import { noop } from 'lodash';

import { AddressInput } from '@webb-dapp/react-components/AddressInput';
import { FormatAddress } from '@webb-dapp/react-components';

import classes from './AddressInput.module.scss';

export interface AddressToInputProps {
  from?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const AddressToInput: FC<AddressToInputProps> = ({ from, onChange, value }) => {
  return (
    <div className={classes.root}>
      <div className={classes.item}>
        <p>From Account</p>
        <p className={classes.fixedAddress}>{from ? <FormatAddress address={from} /> : null}</p>
      </div>
      <div className={classes.item}>
        <p>To Account</p>
        <AddressInput
          border={false}
          inputClassName={classes.addressInput}
          onChange={onChange || noop}
          placeholder='Please Input To Address'
          showIdentIcon={false}
          value={value}
          width={320}
        />
      </div>
    </div>
  );
};

export interface AddressFromInputProps {
  from?: string;
  to?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const AddressFromInput: FC<AddressFromInputProps> = ({ from, onChange, to, value }) => {
  return (
    <div className={classes.root}>
      <div className={classes.item}>
        <p>From Account</p>
        {from ? (
          <p className={classes.fixedAddress}>
            <FormatAddress address={from} />{' '}
          </p>
        ) : (
          <AddressInput
            border={false}
            inputClassName={classes.addressInput}
            onChange={onChange || noop}
            placeholder='Please Select From Account'
            showIdentIcon={false}
            value={value}
            width={320}
          />
        )}
      </div>
      <div className={classes.item}>
        <p>To Account</p>
        <p className={classes.fixedAddress}>{to ? <FormatAddress address={to} /> : null}</p>
      </div>
    </div>
  );
};
