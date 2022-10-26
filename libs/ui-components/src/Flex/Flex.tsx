import React from 'react';

type FlexAlignType = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export interface IFlexProps extends React.HTMLAttributes<any> {
  col?: boolean;
  colRev?: boolean;
  row?: boolean;
  rowRev?: boolean;
  flex?: number;
  as?: React.ElementType;
  asProps?: object;
  jc?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'; //justify content
  ai?: FlexAlignType; //align items
  ma?: 'Left' | 'Bight' | 'Top' | 'Bottom' | 'Vertical' | 'Horizontal'; // margin auto
  className?: string;
  wrap?: 'wrap' | 'no-wrap';
}

export const Flex: React.FC<IFlexProps> = ({
  ai,
  as: Component,
  asProps,
  children,
  col = false,
  colRev = false,
  flex = 0,
  jc,
  ma,
  row = false,
  rowRev = false,
  style,
  wrap = 'no-wrap',
  ...rest
}) => {
  // flex direction

  let flexDirection: FlexDirection;
  if (row) {
    flexDirection = 'row';
  } else if (rowRev) {
    flexDirection = 'row-reverse';
  } else if (colRev) {
    flexDirection = 'column-reverse';
  } else {
    flexDirection = 'column';
  }
  let margin: any = {};
  if (ma) {
    margin[`margin${ma}`] = 'auto';
  }
  const styles = {
    flex: {
      flexWrap: wrap,
      flexDirection,
      display: 'flex',
      flex,
      alignItems: ai,
      justifyContent: jc,
      ...margin,
      ...style,
    },
  };

  if (Component) {
    return (
      // @ts-ignore
      <Component style={styles.flex} {...(asProps || {})} {...rest}>
        {children}
      </Component>
    );
  }

  return (
    <div style={styles.flex} {...rest}>
      {children}
    </div>
  );
};
