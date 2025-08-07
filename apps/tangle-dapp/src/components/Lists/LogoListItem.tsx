import {
  EMPTY_VALUE_PLACEHOLDER,
  Typography,
} from '@tangle-network/ui-components';
import { FC, ReactNode } from 'react';

type Props = {
  logo: ReactNode;
  leftUpperContent: ReactNode | string;
  leftBottomContent?: ReactNode | string;
  leftBottomContentTwo?: ReactNode | string;
  rightUpperText?: string | ReactNode;
  rightBottomText?: string;
};

const LogoListItem: FC<Props> = ({
  logo,
  leftUpperContent,
  leftBottomContent,
  leftBottomContentTwo,
  rightUpperText,
  rightBottomText,
}) => {
  return (
    <>
      <div className="flex items-center gap-3">
        {logo}

        <div className="flex flex-col">
          {typeof leftUpperContent === 'string' ? (
            <Typography
              variant="body1"
              fw="bold"
              className="block text-mono-200 dark:text-mono-0"
            >
              {leftUpperContent}
            </Typography>
          ) : (
            leftUpperContent
          )}

          {leftBottomContent !== undefined ? (
            typeof leftBottomContent === 'string' ? (
              <Typography
                variant="body1"
                className="block text-mono-120 dark:text-mono-100 dark:hover:text-mono-80"
              >
                {leftBottomContent}
              </Typography>
            ) : (
              leftBottomContent
            )
          ) : null}

          {leftBottomContentTwo !== undefined ? (
            typeof leftBottomContentTwo === 'string' ? (
              <Typography
                variant="body1"
                className="block text-mono-120 dark:text-mono-100 dark:hover:text-mono-80"
              >
                {leftBottomContentTwo}
              </Typography>
            ) : (
              leftBottomContentTwo
            )
          ) : null}
        </div>
      </div>

      {(rightUpperText !== undefined || rightBottomText !== undefined) && (
        <div className="flex flex-col items-end justify-center">
          {typeof rightUpperText === 'string' ? (
            <Typography
              variant="body1"
              className="text-mono-200 dark:text-mono-0"
            >
              {rightUpperText ?? EMPTY_VALUE_PLACEHOLDER}
            </Typography>
          ) : (
            <div className="text-mono-200 dark:text-mono-0">
              {rightUpperText ?? EMPTY_VALUE_PLACEHOLDER}
            </div>
          )}

          {rightBottomText !== undefined && (
            <Typography
              variant="body1"
              className="block text-mono-120 dark:text-mono-100 dark:hover:text-mono-80"
            >
              {rightBottomText}
            </Typography>
          )}
        </div>
      )}
    </>
  );
};

export default LogoListItem;
