/* eslint-disable @typescript-eslint/indent */
import { MixerSize } from '@webb-dapp/react-environment/webb-context';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import React, { useEffect, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { FlexBox, getRoundedAmountString } from '../..';

import { InputSection } from '../InputSection/InputSection';

const MixerGroupSelectWrapper = styled.div`
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
  flex-wrap: wrap;
  overflow: auto;
`;
type MixerGroupSelectProps = {
  items: MixerSize[];
  value?: MixerSize;
  onChange?(item: MixerSize): void;
};
const AmountChipWrapper = styled.div<{ selected?: boolean }>`
  cursor: pointer;
  transition: all ease 0.3s;
  text-transform: capitalize;
  height: 50px;
  max-width: 50px;
  ${({ selected, theme }: { theme: Pallet; selected?: boolean }) => css`
    && {
      border: 1px solid ${selected && theme.type === 'dark' ? theme.accentColor : theme.borderColor};
      border-radius: 50%;
      background: ${selected && theme.type === 'light' ? theme.accentColor : 'transparent'};
      font-family: ${FontFamilies.AvenirNext};
      color: ${selected && theme.type === 'dark' ? theme.accentColor : theme.primaryText};
      flex: 1;
      margin: 5px;
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;

      font-style: normal;
      font-weight: 600;
      line-height: 19px;
      text-align: center;
      letter-spacing: -0.065em;
    }
  `}
`;

export const MixerGroupSelect: React.FC<MixerGroupSelectProps> = ({ items, onChange, value }) => {
  const checkedIndex = useMemo(() => {
    return items.findIndex((item) => item.id === value?.id);
  }, [value, items]);

  useEffect(() => {
    if (!value && onChange) {
      onChange(items[0]);
    }
  }, [onChange, value, items]);

  const mixerSizes = useMemo(() => {
    return items.map((item, index) => {
      return {
        ...item,
        selected: index === checkedIndex,
      };
    });
  }, [checkedIndex, items]);

  return (
    <InputSection>
      <MixerGroupSelectWrapper style={{ width: '80%' }}>
        {mixerSizes.map(({ id, selected, title, amount, asset }) => {
          return (
            <AmountChipWrapper
              key={id + title}
              selected={selected}
              onClick={() => {
                onChange?.({
                  title,
                  id,
                  amount,
                  asset
                });
              }}
            >
              {getRoundedAmountString(amount)}
            </AmountChipWrapper>
          );
        })}
      </MixerGroupSelectWrapper>
      <FlexBox width='20%' justifyContent='center' alignItems='center'>
        <p>{items[0].asset}</p>
      </FlexBox>
    </InputSection>
  );
};
