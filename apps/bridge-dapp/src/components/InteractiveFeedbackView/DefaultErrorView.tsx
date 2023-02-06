import { FeedbackEntry } from '@webb-tools/dapp-types';
import {
  Button,
  ModalFooter,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { DefaultErrorViewProps } from './types';

export const DefaultErrorView: FC<DefaultErrorViewProps> = ({
  activeFeedback,
}) => {
  return (
    <>
      <div className="p-9">
        {activeFeedback.feedbackBody.map((entry, idx) => {
          const key = Object.keys(entry)[0] as keyof FeedbackEntry;
          const commonProps = {
            key: `${key}${idx}`,
          };

          switch (key) {
            case 'content':
              return (
                <Typography
                  variant="body1"
                  fw="semibold"
                  className="mb-2"
                  {...commonProps}
                >
                  {entry[key]}
                </Typography>
              );

            case 'json':
              return (
                <Typography
                  variant="body1"
                  fw="semibold"
                  className="mb-2 whitespace-pre-wrap"
                  {...commonProps}
                >
                  <pre>{JSON.stringify(entry[key], null, 4)}</pre>
                </Typography>
              );

            case 'header':
              return (
                <Typography
                  variant="h5"
                  fw="bold"
                  className="mb-6 break-words"
                  {...commonProps}
                >
                  {entry[key]}
                </Typography>
              );

            case 'any':
              return (
                <div className="mb-2" {...commonProps}>
                  {entry[key]?.() ?? null}
                </div>
              );

            default:
              return (
                <div className="mb-2" {...commonProps}>
                  <ul>
                    {entry[key]?.map((entry) => {
                      return (
                        <li key={entry}>
                          <Typography variant="body1" fw="semibold">
                            {entry}
                          </Typography>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
          }
        })}
      </div>

      <ModalFooter>
        {Object.keys(activeFeedback.actions).map((name, idx) => (
          <Button
            size="sm"
            isFullWidth
            onClick={() => {
              activeFeedback?.trigger(name);
            }}
            key={`${name}${idx}`}
          >
            {name}
          </Button>
        ))}

        <Button
          size="sm"
          isFullWidth
          variant="secondary"
          onClick={() => {
            activeFeedback?.cancel();
          }}
        >
          Cancel
        </Button>
      </ModalFooter>
    </>
  );
};
