import React, { FC, useState, useCallback } from 'react';
import { noop } from 'lodash';

import { getInputBorder, styled, SwitchIcon, getInputShadow } from '@webb-dapp/ui-components';

import { FormatNumber } from './format';
import { TokenImage, TokenName } from './Token';
import { BalanceInput, BalanceInputValue } from './BalanceInput';

interface TwoWayBalanceInputProps {
  className?: string;
  error?: string;
  value: [Partial<BalanceInputValue>, Partial<BalanceInputValue>];
  onChange: (value: Partial<BalanceInputValue>) => void;
  onSwap?: () => void;
  onMax?: () => void;
  showSwap?: boolean;
}

const TwoWayBalanceInputRoot = styled.div<{
  error: boolean;
  focused: boolean;
}>`
  display: flex;
  align-items: stretch;
  width: 512px;
  transition: all 200ms cubic-bezier(0.23, 1, 0.32, 1);
  border-radius: 2px;
  border: ${({ error }): string => getInputBorder(false, error)};
  box-shadow: ${({ error, focused }): string => getInputShadow(false, error, focused)};

  &:hover {
    box-shadow: ${({ error }): string => getInputShadow(false, error, true)};
  }
`;

const Swap = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 0 24px;
  cursor: pinter;
`;

const Container = styled.div`
  flex: 1;
`;

const InputRoot = styled.div`
  height: 59.5px;
  border-bottom: 1px solid #e9e9e9;
`;

const DisplayRoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58.5px;
  padding-left: 16px;

  color: var(--text-color-second);
  font-size: 20px;
  line-height: 29px;

  .two-way-balance-input__display__token {
    padding: 0 16px;
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
  }

  .two-way-balance-input__display__token__img {
    width: 24px;
    line-height: 24px;
    margin-right: 8px;
  }
`;

export const TwoWayBalanceInput: FC<TwoWayBalanceInputProps> = ({
  className,
  error,
  value,
  onChange,
  onMax = noop,
  onSwap = noop,
  showSwap = false
}) => {
  const [focused, setFocused] = useState<boolean>(false);

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, [setFocused]);

  const handleBlur = useCallback(() => {
    setFocused(false);
  }, [setFocused]);

  return (
    <TwoWayBalanceInputRoot className={className} error={!!error} focused={focused}>
      {showSwap ? (
        <Swap onClick={onSwap}>
          <SwitchIcon />
        </Swap>
      ) : null}
      <Container>
        <InputRoot>
          <BalanceInput
            error={error}
            noBorder={true}
            onBlur={handleBlur}
            onChange={onChange}
            onFocus={handleFocus}
            onMax={onMax}
            value={value[0]}
          />
        </InputRoot>
        <DisplayRoot>
          <FormatNumber className='two-way-balance-input__display__number' data={value[1].amount} prefix='≈' />
          <div className='two-way-balance-input__display__token'>
            {value[1].token ? (
              <>
                <TokenImage className='two-way-balance-input__display__token__img' currency={value[1].token} />
                <TokenName currency={value[1].token} />
              </>
            ) : null}
          </div>
        </DisplayRoot>
      </Container>
    </TwoWayBalanceInputRoot>
  );
};
