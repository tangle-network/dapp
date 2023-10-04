import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { useMemo } from 'react';
import cx from 'classnames';
import { IconWithTooltip } from '@webb-tools/webb-ui-components/components/IconWithTooltip';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { InformationLine } from '@webb-tools/icons/InformationLine';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { NOTE_ACCOUNT_DOCS_URL } from '../../../constants/links';

const NoteAccountKey = () => {
  const { noteManager } = useWebContext();

  // Get the note account keypair to display public + encryption key
  const keyPairStr = useMemo(
    () => noteManager?.getKeypair().toString(),
    [noteManager]
  );

  return (
    <div
      className={cx(
        'flex rounded-lg text-mono-140 dark:text-mono-80',
        'hover:bg-mono-20 hover:dark:bg-mono-170',
        keyPairStr ? 'items-center' : 'items-start',
        keyPairStr ? 'space-x-1' : 'space-x-0.5',
        keyPairStr ? 'p-2' : 'px-1'
      )}
    >
      {keyPairStr ? (
        <>
          <IconWithTooltip
            icon={<Avatar value={keyPairStr} theme="ethereum" />}
            content="Note account"
          />

          <KeyValueWithButton
            className="mt-0.5"
            label="Public Key:"
            keyValue={keyPairStr}
            size="sm"
            labelVariant="body1"
            valueVariant="body1"
          />
        </>
      ) : (
        <>
          <div className="p-1 !text-inherit">
            <InformationLine className="!fill-current" />
          </div>

          <Typography
            component="p"
            variant="body3"
            className="!text-inherit flex-[1_0_0]"
          >
            No note account linked. Create a note account to start private
            transactions.{' '}
            <a
              className="hover:underline"
              target="_blank"
              href={NOTE_ACCOUNT_DOCS_URL}
              rel="noreferrer noopener"
            >
              (Learn More)
            </a>
          </Typography>
        </>
      )}
    </div>
  );
};

export default NoteAccountKey;
