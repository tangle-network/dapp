import React, { FC, ReactNode, useMemo } from 'react';
import styled from 'styled-components';

import { ReactComponent as RightArrowIcon } from './assets/right-arrow.svg';
import { ReactComponent as AddIcon } from './assets/add.svg';

const Root = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 58px 1fr;
  grid-template-rows: auto 58px auto;
  grid-template-areas: 
    'left-title . right-title'
    'left-content separation right-content'
    'left-addition . right-addition'
  ;
`;

const Title = styled.div`
  font-size: var(--text-size-md);
  line-height: 1.1875;
`;

const LeftTitle = styled(Title)`
  grid-area: left-title;
  margin-bottom: 24px;
`;

const RightTitle = styled(Title)`
  grid-area: right-title;
  margin-bottom: 24px;
`;

const LeftContent = styled.div`
  grid-area: left-content
`;

const RightContent = styled.div`
  grid-area: right-content
`;

const Separation = styled.div`
  grid-area: separation;
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
`;

const LeftAddition = styled.div`
  grid-area: left-addition;
  margin-top: 16px;
`;

const RightAddition = styled.div`
  grid-area: right-addition;
  margin-top: 16px;
`;

export interface InputFieldProps {
  leftAddition?: () => ReactNode;
  leftTitle: () => ReactNode;
  leftRender: () => ReactNode;
  rightAddition?: () => ReactNode;
  rightTitle: () => ReactNode;
  rightRender: () => ReactNode;
  separation: 'right-arrow' | 'plus' | (() => ReactNode);
  leftContentClassName?: string;
  rightContentClassName?: string;
}

export const InputField: FC<InputFieldProps> = ({
  leftAddition,
  leftRender,
  leftTitle,
  rightAddition,
  rightRender,
  rightTitle,
  separation
}) => {
  const _separation = useMemo(() => {
    if (separation === 'right-arrow') {
      return <RightArrowIcon />;
    }

    if (separation === 'plus') {
      return <AddIcon />;
    }

    return separation();
  }, [separation]);

  return (
    <Root>
      <LeftTitle>
        {leftTitle()}
      </LeftTitle>
      <LeftContent>
        {leftRender()}
      </LeftContent>
      <Separation>
        {_separation}
      </Separation>
      <RightTitle>
        {rightTitle()}
      </RightTitle>
      <RightContent>
        {rightRender()}
      </RightContent>
      {
        leftAddition ? (
          <LeftAddition>
            {leftAddition()}
          </LeftAddition>
        ) : null
      }
      {
        rightAddition ? (
          <RightAddition>
            {rightAddition()}
          </RightAddition>
        ) : null
      }
    </Root>
  );
};
