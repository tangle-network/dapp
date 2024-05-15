import { FC } from 'react';
import { UnselectedNetworkViewProps } from './types';
import { Close } from '@webb-tools/icons';
import { FeedbackEntry } from '@webb-tools/dapp-types';
import { Typography } from '@webb-tools/webb-ui-components';

export const UnselectedNetworkView: FC<UnselectedNetworkViewProps> = ({
  activeFeedback,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-5 pt-1 pb-10 text-center">
      <div className="flex justify-end w-full">
        <button onClick={() => activeFeedback.cancel()}>
          <Close size="lg" />
        </button>
      </div>

      <div className="max-w-[350px]">
        {activeFeedback.feedbackBody.map((entry, idx) => {
          const key = Object.keys(entry)[0] as keyof FeedbackEntry;
          const commonProps = {
            key: `${key}${idx}`,
          };

          switch (key) {
            case 'content':
              return (
                <div className="py-1" {...commonProps}>
                  <Typography variant="body3" className="break-words">
                    {entry[key]}
                  </Typography>
                </div>
              );

            case 'header':
              return (
                <Typography
                  variant="body3"
                  className="break-words"
                  {...commonProps}
                >
                  {entry[key]}
                </Typography>
              );

            case 'any':
              return <div {...commonProps}>{entry[key]?.() ?? null}</div>;

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};
