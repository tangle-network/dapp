import { InformationLine } from '@webb-tools/icons';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography/Typography';
import { Button } from '../Button';
import { Input } from '../Input';
import { Label } from '../Label';
import { TitleWithInfo } from '../TitleWithInfo';
import { InputWrapper } from './InputWrapper';
import { RecipientInputProps } from './types';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { notificationApi } from '../Notification';

function isValidPublicKey(maybePublicKey: string): boolean {
  return maybePublicKey.startsWith('0x') && maybePublicKey.length === 130;
}

function isValidAddress(address: string) {
  const maybeEvm = address.replace('0x', '').length === 40;
  const maybeSS58 = !address.startsWith('0x');
  const maybeDecodedAddress = address.replace('0x', '').length === 64;
  // is valid evm address
  if (maybeEvm) {
    return isEthereumAddress(address);
  }
  if (maybeSS58) {
    try {
      encodeAddress(decodeAddress(address));
      return true;
    } catch {
      return false;
    }
  }
  if (maybeDecodedAddress) {
    try {
      encodeAddress(address);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * The `RecipientInput` component
 *
 * Props:
 *
 * - `value`: The input value
 * - `onChange`: Callback function to control the input value
 *
 * @example
 *
 * ```jsx
 *   <RecipientInput {...recipientInputProps} />
 *  <RecipientInput value={recipient} onChange={(nextVal) => setRecipient(nextVal.toString())} />
 * ```
 */

export const RecipientInput = forwardRef<HTMLDivElement, RecipientInputProps>(
  (
    {
      className,
      errorMessage,
      id = 'recipient',
      info,
      onChange: onChangeProp,
      overrideInputProps,
      title,
      value,
      isValidSet,
      ...props
    },
    ref
  ) => {
    const [address, setAddress] = useState<string | undefined>(() => value);

    const onClick = useCallback(async () => {
      try {
        const addr = await window.navigator.clipboard.readText();

        setAddress(addr);
      } catch (e) {
        notificationApi({
          message: 'Failed to read clipboard',
          secondaryMessage:
            'Please change your browser settings to allow clipboard access.',
          variant: 'warning',
        });
      }
    }, [setAddress]);
    const [recipientError, setRecipientError] = useState<string | undefined>(
      undefined
    );
    const onChange = useCallback(
      (nextVal: string) => {
        const address = nextVal.trim();
        setAddress(address.toString());
        onChangeProp?.(address);
        if (
          isValidAddress(address) ||
          address === '' ||
          isValidPublicKey(address)
        ) {
          setRecipientError(undefined);
        } else {
          setRecipientError('Invalid wallet address ');
        }
      },
      [onChangeProp, setAddress, setRecipientError]
    );

    useEffect(() => {
      setAddress(value);
    }, [value, setAddress]);

    const error = useMemo(
      () => errorMessage || recipientError,
      [recipientError, errorMessage]
    );

    useEffect(() => {
      const isValid = (error?.trim() ?? '') === '';
      isValidSet?.(isValid);
    }, [error, isValidSet]);

    return (
      <>
        <InputWrapper
          {...props}
          className={twMerge('cursor-auto space-x-2', className)}
          ref={ref}
        >
          <div className="flex flex-col w-full space-y-1">
            <Label htmlFor={id}>
              <TitleWithInfo
                title={title ?? id}
                info={info}
                variant="utility"
                titleComponent="span"
                className="text-mono-100 dark:text-mono-80"
                titleClassName="capitalize !text-inherit"
              />
            </Label>
            <Input
              placeholder="Enter recipient wallet address"
              id={id}
              size="sm"
              value={address}
              onChange={onChange}
              {...overrideInputProps}
            />
          </div>

          {!address && (
            <Button variant="utility" size="sm" onClick={onClick}>
              Paste
            </Button>
          )}
        </InputWrapper>

        {error && (
          <span className="flex text-red-70 dark:text-red-50 items-center">
            <InformationLine className="!fill-current mr-1" />
            <Typography variant="body1" fw="bold" className="!text-current">
              {error}
            </Typography>
          </span>
        )}
      </>
    );
  }
);
