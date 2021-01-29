import React, { FC, ReactElement, useContext, useCallback, useState } from 'react';

import { TagGroup, Tag, styled } from '@webb-dapp/ui-components';
import { TagInput } from '@webb-dapp/ui-components/TagInput';

import { SwapContext } from './SwapProvider';

const SLIPPAGE_MAX = 50;
const SLIPPAGE_MIN = 0;
const SUGGEST_VALUES = [0.001, 0.005, 0.01];
const SUGGESTED_INDEX = 1; // suggest slippage positions

const Root = styled.div`
  padding: 16px 24px;
  background: #eff1f7;
  border-radius: 12px;
  border: 1px solid #ecf0f2;
`;

const Title = styled.div`
  margin-bottom: 16px;
  font-size: 16px;
  line-height: 19px;
  font-weight: 500;
  color: var(--text-color-primary);
`;

export const SlippageInput: FC = () => {
  const { acceptSlippage, setAcceptSlippage } = useContext(SwapContext);
  const [custom, setCustom] = useState<number>(0);

  const handleClick = useCallback(
    (num: number): void => {
      setAcceptSlippage(num);
      setCustom(0);
    },
    [setAcceptSlippage]
  );

  const renderSuggest = useCallback((num: number): string => {
    return `${num * 100}%${num === SUGGEST_VALUES[SUGGESTED_INDEX] ? ' (suggested)' : ''}`;
  }, []);

  const handleInput = useCallback(
    (_value: number | string): void => {
      const value = Number(_value);

      setCustom(value);
      setAcceptSlippage(value / 100);
    },
    [setAcceptSlippage, setCustom]
  );

  return (
    <Root>
      <Title>Limit addtion price slippage</Title>
      <TagGroup>
        {SUGGEST_VALUES.map(
          (suggest): ReactElement => {
            return (
              <Tag
                key={`suggest-${suggest}`}
                onClick={(): void => handleClick(suggest)}
                style={acceptSlippage === suggest ? 'primary' : 'normal'}
              >
                {renderSuggest(suggest)}
              </Tag>
            );
          }
        )}
        <TagInput
          id='custom'
          label='%'
          max={SLIPPAGE_MAX}
          min={SLIPPAGE_MIN}
          name='custom'
          onChange={handleInput}
          placeholder='Custom'
          value={custom}
        />
      </TagGroup>
    </Root>
  );
};
