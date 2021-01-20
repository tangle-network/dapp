import { FC } from 'react';
import styled from 'styled-components';

import { BareProps } from './types';

export const InlineBlockBox = styled.div<{ margin?: number | number[] }>`
  display: inline-block;
  margin: ${({ margin }): string => {
    if (Array.isArray(margin)) {
      return margin.map((i) => i + 'px').join(' ');
    }

    return margin + 'px';
  }};
`;

interface FlexBoxProps extends BareProps {
  alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'center';
  justifyContent?: 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | 'center';
  width?: string;
}

export const FlexBox: FC<FlexBoxProps> = styled.div`
  display: flex;
  width: ${({ width }): string => width || 'auto'};
  justify-content: ${({ justifyContent }: FlexBoxProps): string => justifyContent || 'flex-start'};
  align-items: ${({ alignItems }: FlexBoxProps): string => alignItems || 'center'};
`;

interface PaddingBoxProps extends BareProps {
  inline?: boolean;
  padding: number | string;
}

export const PaddingBox: FC<PaddingBoxProps> = styled.div`
  display: ${({ inline }: PaddingBoxProps): string => inline ? 'inline-block' : 'block'};
  padding: ${({ padding }: PaddingBoxProps): string => typeof padding === 'number' ? padding + 'px' : padding};
`;

interface GridBoxProps extends BareProps {
  column: number;
  row: number | 'auto';
  padding?: number;
}

export const GridBox = styled.div<GridBoxProps>`
  display: grid;
  grid-gap: ${({ padding }): string => padding + 'px'};
  grid-template-columns: ${({ column }): string => `repeat(${column}, 1fr)`};
  grid-template-rows: ${({ row }): string => row === 'auto' ? 'auto' : `repeat(${row}) 1fr`};
`;

export const SpaceBox = styled.div<{ height: number}>`
  width: 100%;
  height: ${({ height }): number => height}px;
`;
