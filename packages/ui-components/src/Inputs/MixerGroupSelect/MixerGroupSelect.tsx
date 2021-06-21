/* eslint-disable @typescript-eslint/indent */
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import React, { useEffect, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { MixerSize } from '@webb-dapp/react-environment/webb-context';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';

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

  ${({ selected, theme }: { theme: Pallet; selected?: boolean }) => css`
		&& {
			border: 1px solid ${theme.borderColor2};
			border-radius: 20px;
			background: ${selected ? `#ebedf2` : theme.layer3Background}
			font-family: ${FontFamilies.AvenirNext};
			color: rgba(255, 255, 255, 0.5);
			height: 40px;
			padding: 0 5px;
			flex: 1;
			margin: 5px;
			white-space: nowrap;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 14px;
			font-weight: bold;
		}
	`}
`;

export const MixerGroupSelect: React.FC<MixerGroupSelectProps> = ({ items, onChange, value }) => {
  const checkedIndex = useMemo(() => {
    return items.findIndex((item) => item.id === value?.id);
  }, [value, items]);

  useEffect(() => {
    if (!value && onChange) {
      onChange(items[1]);
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
    <InputLabel label={'Select Amount'}>
      <MixerGroupSelectWrapper>
        {mixerSizes.map(({ selected, id, title }) => {
          return (
            <AmountChipWrapper
              key={id + title}
              selected={selected}
              onClick={() => {
                onChange?.({
                  title,
                  id,
                });
              }}
            >
              {title}
            </AmountChipWrapper>
          );
        })}
      </MixerGroupSelectWrapper>
    </InputLabel>
  );
};
