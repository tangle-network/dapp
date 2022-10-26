import { Button, Typography } from '@mui/material';
import { FeedbackEntry, InteractiveFeedback } from '@nepoche/dapp-types';
import { CloseIcon } from '@nepoche/ui-components';
import { Padding } from '@nepoche/ui-components/Padding/Padding';
import React from 'react';
import styled from 'styled-components';

const UnselectedNetworkViewWrapper = styled.div`
  text-align: center;
  display: flex;
  padding: 5px 20px 40px;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

type UnselectedNetworkViewProps = {
  activeFeedback: InteractiveFeedback;
};

const UnselectedNetworkView: React.FC<UnselectedNetworkViewProps> = ({ activeFeedback }) => {
  return (
    <>
      <UnselectedNetworkViewWrapper>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => activeFeedback.cancel()}>
            <CloseIcon />
          </Button>
        </div>
        <div style={{ maxWidth: '350px' }}>
          {activeFeedback.feedbackBody.map((entry, idx) => {
            const key = Object.keys(entry)[0] as keyof FeedbackEntry;
            const commonProps = {
              key: `${key}${idx}`,
            };

            switch (key) {
              case 'content':
                return (
                  <Padding x={0} v={1} {...commonProps}>
                    <Typography className={'text'} style={{ wordWrap: 'break-word' }}>
                      {entry[key]}
                    </Typography>
                  </Padding>
                );
              case 'header':
                return (
                  <Typography variant={'h3'} style={{ wordWrap: 'break-word' }} {...commonProps}>
                    {entry[key]}
                  </Typography>
                );
              case 'any':
                return <div {...commonProps}>{entry[key]?.() ?? null}</div>;
            }
          })}
        </div>
      </UnselectedNetworkViewWrapper>
    </>
  );
};

export default UnselectedNetworkView;
