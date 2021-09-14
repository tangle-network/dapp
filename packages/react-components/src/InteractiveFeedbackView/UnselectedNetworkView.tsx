import { FeedbackEntry, InteractiveFeedback } from "@webb-dapp/utils/webb-error";
import { ReactComponent as NetworksGlobe } from '@webb-dapp/ui-components/assets/NetworksGlobe.svg';
import NetworksGlobeCircled from '@webb-dapp/ui-components/assets/NetworksGlobeCircled.png';
import NetworksGlobeCircledInverted from '@webb-dapp/ui-components/assets/NetworksGlobeCircledInverted.png';
import React from 'react';
import { Button, Typography } from "@material-ui/core";
import styled from 'styled-components';
import { Padding } from "@webb-dapp/ui-components/Padding/Padding";
import { CloseIcon } from '@webb-dapp/ui-components/';
import { useStore } from "@webb-dapp/react-environment/";

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
  const { setTheme, theme } = useStore('ui');
  const isDarkTheme = theme === 'dark';

  return (
    <>
      <UnselectedNetworkViewWrapper>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => activeFeedback.cancel()}>
            <CloseIcon />
          </Button>
        </div>
        <div>
          <img src={NetworksGlobeCircled} />
        </div>
        <div style={{ maxWidth: '350px' }}>
          {activeFeedback.feedbackBody.map((entry) => {
            const key = Object.keys(entry)[0] as keyof FeedbackEntry;
            switch (key) {
              case 'content':
                return (
                  <Padding x={0} v={1}>
                    <Typography className={'text'} style={{ wordWrap: 'break-word' }}>
                      {entry[key]}
                    </Typography>
                  </Padding>
                );
              case 'header':
                return (
                  <Typography variant={'h3'} style={{ wordWrap: 'break-word' }}>
                    {entry[key]}
                  </Typography>
                );
              case 'any':
                return entry[key]?.() ?? null;
            }
          })}
        </div>
      </UnselectedNetworkViewWrapper>
    </>
  );
};

export default UnselectedNetworkView;
