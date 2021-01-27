import { FixedPointNumber } from '@webb-tools/sdk-core';
import { getTokenName, isValidateAddress, BalanceInputValue } from '@webb-dapp/react-components';
import { CurrencyId } from '@webb-tools/types/interfaces';

import { useBalance } from './balanceHooks';
import { useCallback, useLayoutEffect } from 'react';
import { useMemorized } from './useMemorized';

interface UseNumberValidatorConfig {
  min: {
    value: number;
    customText?: string;
  };
  max: {
    value: number;
    customText?: string;
  };
  updateValidator?: (value: (value: number) => Promise<any>) => void;
}

export const useNumberValidator = (config: UseNumberValidatorConfig): (value: number) => Promise<any> => {
  const _config = useMemorized(config);

  const fn = useCallback((value: number): Promise<any> => {
    if (value === 0) return Promise.resolve();

    if (_config.max && value > _config.max.value) {
      return Promise.reject(
        new Error(_config.max.customText
          ? _config.max.customText
          : `Greater than the max amount ${_config.max.value}`)
      );
    }

    if (_config.min && value < _config.min.value) {
      return Promise.reject(
        new Error(_config.min.customText
          ? _config.min.customText
          : `Less than The min amount ${_config.min.value}`
        )
      );
    }

    return Promise.resolve();
  /* eslint-disable-next-line */
  }, [_config]);

  useLayoutEffect(() => {
    if (_config.updateValidator) {
      _config.updateValidator(fn);
    }
  }, [fn, _config]);

  return fn;
};

interface UseBalanceValidatorConfig {
  currency?: CurrencyId;
  max?: [FixedPointNumber, string];
  min?: [FixedPointNumber, string];
  checkBalance?: boolean;
  updateValidator?: (value: (value: Partial<BalanceInputValue>) => Promise<any>) => void;
}

export const useBalanceValidator = (config: UseBalanceValidatorConfig): (value: BalanceInputValue) => Promise<any> => {
  const _config = useMemorized(config);
  const balance = useBalance(_config.currency);

  const fn = useCallback(({ amount }: Partial<BalanceInputValue>): Promise<any> => {
    if (!_config.currency || !amount) return Promise.resolve();

    const _amount = new FixedPointNumber(amount);

    if (_amount.isZero()) return Promise.resolve();

    if (_config.max && _amount.isGreaterThan(_config.max[0])) {
      return Promise.reject(new Error(_config.max[1] ? _config.max[1] : `Greater than the max amount ${_config.max[0].toNumber()}`));
    }

    if (_config.min && _amount.isLessThan(_config.min[0])) {
      return Promise.reject(new Error(_config.min[1] ? _config.min[1] : `Less than The min amount ${_config.min[0].toNumber()}`));
    }

    let checkBalance = true;

    if (Reflect.has(_config, 'checkBalance')) {
      checkBalance = _config.checkBalance as boolean;
    }

    if (checkBalance && _amount.isGreaterThan(balance)) {
      return Promise.reject(new Error(`Insufficient ${getTokenName(_config.currency)} balance`));
    }

    return Promise.resolve();
  /* eslint-disable-next-line */
  }, [_config, balance]);

  useLayoutEffect(() => {
    if (_config.updateValidator) {
      _config.updateValidator(fn);
    }
  }, [fn, _config]);

  return fn;
};

interface UseAddressValidatorConfig {
  required?: boolean;
}

export const useAddressValidator = (config: UseAddressValidatorConfig): (value: string) => Promise<any> => {
  const _config = useMemorized(config);

  const fn = useCallback((value: string) => {
    if (_config.required && !value) {
      return Promise.reject(new Error('Address is Required'));
    }

    const result = isValidateAddress(value);

    if (!result) {
      return Promise.reject(new Error('Invalid Address'));
    }

    return Promise.resolve();
  }, [_config]);

  return fn;
};
