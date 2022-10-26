import { Chip as MuiChip, ChipProps as MuiChipProps, useTheme } from '@mui/material';
import { useColorPallet } from '@nepoche/styled-components-theme';
import React, { useMemo } from 'react';

export type ChipProps = Omit<MuiChipProps, 'color'> & {
  color: MuiChipProps['color'] | 'success' | 'error' | 'warning' | 'info';
  component?: React.ElementType;
};

export const Chip: React.FC<ChipProps> = ({ color, style: styleProp = {}, variant, ...restProps }) => {
  const theme = useTheme();
  const pallet = useColorPallet();
  const style: Pick<React.CSSProperties, 'color' | 'backgroundColor' | 'border'> = {};

  const isLight = useMemo(() => pallet.type === 'light', [pallet.type]);
  const isOutline = useMemo(() => variant === 'outlined', [variant]);
  const muiColorProp = useMemo(
    () => (color === 'default' || color === 'primary' || color === 'secondary' ? color : undefined),
    [color]
  );

  switch (color) {
    case 'success': {
      if (isOutline) {
        const color = isLight ? theme.palette.success.main : theme.palette.success.light;
        style['color'] = color;
        style['border'] = `1px solid ${color}`;
      } else {
        style['color'] = isLight ? '#fff' : '#000';
        style['backgroundColor'] = isLight ? theme.palette.success.light : theme.palette.success.main;
      }
      break;
    }

    case 'error': {
      if (isOutline) {
        const color = isLight ? theme.palette.error.main : theme.palette.error.light;
        style['color'] = color;
        style['border'] = `1px solid ${color}`;
      } else {
        style['color'] = isLight ? '#fff' : '#000';
        style['backgroundColor'] = isLight ? theme.palette.error.light : theme.palette.error.main;
      }
      break;
    }

    case 'info': {
      if (isOutline) {
        const color = isLight ? theme.palette.info.main : theme.palette.info.light;
        style['color'] = color;
        style['border'] = `1px solid ${color}`;
      } else {
        style['color'] = isLight ? '#fff' : '#000';
        style['backgroundColor'] = isLight ? theme.palette.info.light : theme.palette.info.main;
      }
      break;
    }

    case 'warning': {
      if (isOutline) {
        const color = isLight ? theme.palette.warning.main : theme.palette.warning.light;
        style['color'] = color;
        style['border'] = `1px solid ${color}`;
      } else {
        style['color'] = isLight ? '#fff' : '#000';
        style['backgroundColor'] = isLight ? theme.palette.warning.light : theme.palette.warning.main;
      }
      break;
    }

    default: {
      break;
    }
  }

  return <MuiChip color={muiColorProp} variant={variant} style={{ ...style, ...styleProp }} {...restProps} />;
};
