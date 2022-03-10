/* eslint-disable @typescript-eslint/indent */
import { MixerSize } from '@webb-dapp/react-environment/webb-context';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import React, { useEffect, useMemo } from 'react';
import styled, { css } from 'styled-components';

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
const AmountChipWrapper = styled.span<{ selected?: boolean }>`
  cursor: pointer;
  transition: all ease 0.3s;
  text-transform: capitalize;
  ${({ selected, theme }: { theme: Pallet; selected?: boolean }) => css`
    && {
      border: 1px solid ${selected && theme.type === 'dark' ? theme.accentColor : theme.borderColor};
      border-radius: 20px;
      background: ${selected && theme.type === 'light' ? theme.accentColor : 'transparent'};
      font-family: ${FontFamilies.AvenirNext};
      color: ${selected && theme.type === 'dark' ? theme.accentColor : theme.primaryText};
      height: 40px;
      padding: 0 5px;
      flex: 1;
      margin: 5px;
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;

      font-style: normal;
      font-weight: 500;
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
      <InputLabel label={'Select Amount'}>
        <MixerGroupSelectWrapper>
          {mixerSizes.map(({ amount, asset, id, selected, title }) => {
            return (
              <AmountChipWrapper
                key={id + title}
                selected={selected}
                onClick={() => {
                  onChange?.({
                    title,
                    id,
                    amount,
                    asset,
                  });
                }}
              >
                {amount}
              </AmountChipWrapper>
            );
          })}
        </MixerGroupSelectWrapper>
      </InputLabel>
    </InputSection>
  );
};
