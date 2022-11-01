import React from 'react';

export type DimensionsState = {
  window: {
    width: number;
    height: number;
  };
  scroll: {
    x: number;
    y: number;
  };
};
export type DimensionsStateProps = {
  state: DimensionsState;
};
export type DimensionsContext = React.Context<DimensionsStateProps>;
