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
  children,
  ai,
  jc,
  col = false,
  colRev = false,
  row = false,
  rowRev = false,
  flex = 0,
  ma,
  style,
  as: Component,
  asProps,
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
