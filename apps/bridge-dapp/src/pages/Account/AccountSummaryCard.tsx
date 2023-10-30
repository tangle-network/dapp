import { DropdownMenuTrigger as DropdownButton } from '@radix-ui/react-dropdown-menu';
import { useWebContext } from '@webb-tools/api-provider-environment';
import ArrowLeftRightLineIcon from '@webb-tools/icons/ArrowLeftRightLineIcon';
import { ArrowRightUp } from '@webb-tools/icons/ArrowRightUp';
import { ChevronDown } from '@webb-tools/icons/ChevronDown';
import EyeLineIcon from '@webb-tools/icons/EyeLineIcon';
import QRScanLineIcon from '@webb-tools/icons/QRScanLineIcon';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import type { IconBase } from '@webb-tools/icons/types';
import { MenuItem } from '@webb-tools/webb-ui-components';
import {
  Dropdown,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import IconButton from '@webb-tools/webb-ui-components/components/buttons/IconButton';
import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import capitalize from 'lodash/capitalize';
import type { ComponentProps, ElementRef } from 'react';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import NoteAccountAvatarWithKey from '../../components/NoteAccountAvatarWithKey';
import {
  BRIDGE_PATH,
  DEPOSIT_PATH,
  TRANSFER_PATH,
  WITHDRAW_PATH,
} from '../../constants';
import { useNavigate } from 'react-router';

const AccountSummaryCard = forwardRef<ElementRef<'div'>, PropsOf<'div'>>(
  ({ className, ...props }, ref) => {
    const { noteManager } = useWebContext();
    const keypair = noteManager?.getKeypair();

    if (!keypair) {
      return null;
    }

    return (
      <div
        {...props}
        className={twMerge(
          'rounded-2xl border-2 p-6 space-y-6',
          'border-mono-0 bg-mono-0/70 dark:border-mono-160 dark:bg-mono-0/5',
          'dark:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] dark:backdrop-blur-sm',
          'w-full max-w-[556px]',
          className
        )}
      >
        <header>
          <NoteAccountAvatarWithKey
            keyValue={keypair.toString()}
            fontWeight="normal"
            label="Note Account:"
            iconTooltipContent="Note account public key"
          />
        </header>

        <TotalShieldedBalance
          formatedBalance="0"
          availableTokens={[]}
          tokenSymbol="ETH"
          onTokenChange={(token) => {
            console.log(token);
          }}
        />

        <Actions />
      </div>
    );
  }
);

export default AccountSummaryCard;

/** @internal */
function TotalShieldedBalance(props: {
  formatedBalance: string;
  tokenSymbol: string;
  availableTokens: string[];
  onTokenChange: (token: string) => void;
}) {
  const { availableTokens, formatedBalance, onTokenChange, tokenSymbol } =
    props;

  return (
    <div>
      <div className="flex items-center gap-2">
        <Typography variant="body1" className="text-mono-120 dark:text-mono-40">
          Total Shielded Balance
        </Typography>

        <IconButton>
          <EyeLineIcon />
        </IconButton>
      </div>

      <div className="flex items-center gap-4">
        <Typography variant="h2" component="p" fw="bold">
          {formatedBalance}
        </Typography>

        <Dropdown>
          <DropdownButton
            className="flex items-center gap-1 disabled:cursor-not-allowed"
            disabled={availableTokens.length === 0}
          >
            <TokenIcon name={tokenSymbol} />
            <Typography
              component="span"
              variant="body1"
              fw="semibold"
              className="text-mono-120 dark:text-mono-40"
            >
              {tokenSymbol}
            </Typography>

            <ChevronDown className="mx-2 transition-transform duration-300 ease-in-out enabled:group-radix-state-open:rotate-180" />
          </DropdownButton>

          <DropdownBody className="mt-2">
            <ScrollArea className="max-h-[var(--dropdown-height)]">
              <ul>
                {availableTokens.map((token, idx) => (
                  <li key={`${token}-${idx}`}>
                    <MenuItem
                      startIcon={<TokenIcon name={token} />}
                      onSelect={() => onTokenChange(token)}
                    >
                      {token}
                    </MenuItem>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DropdownBody>
        </Dropdown>
      </div>
    </div>
  );
}

const paths = [DEPOSIT_PATH, TRANSFER_PATH, WITHDRAW_PATH] as const;
const icons = [
  <ArrowRightUp size="lg" />,
  <ArrowLeftRightLineIcon size="lg" />,
  <ArrowRightUp size="lg" className="rotate-90" />,
] as const;

const actionItems = paths.map((path, idx) => ({
  label: capitalize(path),
  path: `/${BRIDGE_PATH}/${path}`,
  icon: icons[idx],
}));

const ActionItem = (props: {
  icon: React.ReactElement<IconBase>;
  label: string;
  onClick?: ComponentProps<'button'>['onClick'];
}) => {
  const { icon, label, onClick } = props;

  return (
    <p className="space-y-2">
      <IconButton className="block mx-auto" onClick={onClick}>
        {icon}
      </IconButton>

      <Typography component="span" variant="body1" className="block">
        {label}
      </Typography>
    </p>
  );
};

function Actions() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-6">
      <ActionItem icon={<QRScanLineIcon size="lg" />} label="Receive" />
      {actionItems.map(({ path, ...restItem }) => (
        <ActionItem key={path} {...restItem} onClick={() => navigate(path)} />
      ))}
    </div>
  );
}
