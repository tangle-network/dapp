import React from 'react';

export interface IPaddingProps extends React.HTMLAttributes<any> {
  x?: number;
  v?: boolean | number;
  fullWidth?: boolean;
  fullHeight?: boolean;
  as?: React.ElementType;
  asProps?: object;
}

export const Padding: React.FC<IPaddingProps> = ({
  children,
  v,
  x = 1,
  fullWidth,
  fullHeight,
  style = {},
  as,
  asProps = {},
  ...rest
}) => {
  const verticalPadding = (typeof v === 'number' ? v : v === true ? x : 0) * 9;
  style = {
    paddingTop: verticalPadding,
    paddingBottom: verticalPadding,
    paddingLeft: x * 9,
    paddingRight: x * 9,
    ...style,
  };
  if (fullWidth) {
    style.width = '100%';
  }
  if (fullHeight) {
    style.flex = 1;
  }
  const styles = {
    Padding: style,
  };
  // @ts-ignore
  const C = as || 'div';
  return (
    // @ts-ignore
    <C style={styles.Padding} {...rest} {...asProps}>
      {children}
    </C>
  );
};
