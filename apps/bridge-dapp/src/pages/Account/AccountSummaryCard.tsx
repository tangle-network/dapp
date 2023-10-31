import { DropdownMenuTrigger as DropdownButton } from '@radix-ui/react-dropdown-menu';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import ArrowLeftRightLineIcon from '@webb-tools/icons/ArrowLeftRightLineIcon';
import { ArrowRightUp } from '@webb-tools/icons/ArrowRightUp';
import { ChevronDown } from '@webb-tools/icons/ChevronDown';
import EyeLineIcon from '@webb-tools/icons/EyeLineIcon';
import QRScanLineIcon from '@webb-tools/icons/QRScanLineIcon';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import type { IconBase } from '@webb-tools/icons/types';
import { useBalancesFromNotes } from '@webb-tools/react-hooks/currency/useBalancesFromNotes';
import {
  MenuItem,
  getRoundedAmountString,
} from '@webb-tools/webb-ui-components';
import {
  Dropdown,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import IconButton from '@webb-tools/webb-ui-components/components/buttons/IconButton';
import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import capitalize from 'lodash/capitalize';
import type { ComponentProps, ElementRef } from 'react';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { formatEther } from 'viem';
import HiddenValue from '../../components/HiddenValue';
import NoteAccountAvatarWithKey from '../../components/NoteAccountAvatarWithKey';
import {
  BRIDGE_PATH,
  DEPOSIT_PATH,
  TRANSFER_PATH,
  WITHDRAW_PATH,
} from '../../constants';
import useHiddenValue from '../../hooks/useHiddenValue';

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
        ref={ref}
      >
        <header>
          <NoteAccountAvatarWithKey
            keyValue={keypair.toString()}
            fontWeight="normal"
            label="Note Account:"
            iconTooltipContent="Note account public key"
          />
        </header>

        <TotalShieldedBalance />

        <Actions />
      </div>
    );
  }
);

export default AccountSummaryCard;

/** @internal */
function useShieldedBalances() {
  const { initialized, balances } = useBalancesFromNotes();

  if (!initialized) {
    return;
  }

  return Object.entries(balances).reduce(
    (acc, [currencyId, balancesRecord]) => {
      const existedRecord = acc.get(+currencyId);
      const totalCurrentRecord = Object.values(balancesRecord).reduce(
        (acc, balance) => acc + balance,
        ZERO_BIG_INT
      );

      acc.set(
        +currencyId,
        typeof existedRecord === 'bigint'
          ? existedRecord + totalCurrentRecord
          : totalCurrentRecord
      );

      return acc;
    },
    new Map<number, bigint>()
  );
}

/** @internal */
function TotalShieldedBalance() {
  const [currencyId, setCurrencyId] = useState<number | undefined>();

  const [, setIsHiddenValue] = useHiddenValue();

  const { apiConfig } = useWebContext();
  const balances = useShieldedBalances();

  useEffect(() => {
    if (!balances || balances.size === 0) {
      return;
    }

    const [currencyId] = Array.from(balances.entries())[0];
    setCurrencyId(currencyId);
  }, [balances]);

  const formatedBalance = useMemo(() => {
    if (!balances || typeof currencyId !== 'number') {
      return '0';
    }

    const balance = balances.get(currencyId);
    if (typeof balance !== 'bigint') {
      return '0';
    }

    return getRoundedAmountString(Number(formatEther(balance)));
  }, [balances, currencyId]);

  const tokenSymbol = useMemo(() => {
    if (typeof currencyId !== 'number') {
      return '';
    }

    return apiConfig.currencies[currencyId]?.symbol ?? '';
  }, [apiConfig.currencies, currencyId]);

  const availableCurrencyCfgs = useMemo(() => {
    if (!balances) {
      return [];
    }

    return Array.from(balances.keys())
      .map((currencyId) => apiConfig.currencies[currencyId])
      .filter(Boolean);
  }, [apiConfig.currencies, balances]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Typography variant="body1" className="text-mono-120 dark:text-mono-40">
          Total Shielded Balance
        </Typography>

        <IconButton onClick={() => setIsHiddenValue((prev) => !prev)}>
          <EyeLineIcon />
        </IconButton>
      </div>

      <div className="flex items-center gap-4">
        <Typography variant="h2" component="p" fw="bold">
          <HiddenValue>{formatedBalance}</HiddenValue>
        </Typography>

        <Dropdown>
          <DropdownButton
            className={cx(
              'flex items-center gap-1 disabled:cursor-not-allowed',
              {
                hidden: !tokenSymbol,
              }
            )}
            disabled={availableCurrencyCfgs.length === 0 || !tokenSymbol}
          >
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

          <DropdownBody className="mt-2" align="center">
            <ScrollArea className="max-h-[var(--dropdown-height)]">
              <ul>
                {availableCurrencyCfgs.map(({ name, symbol, id }) => (
                  <li key={`${name}-${id}`}>
                    <MenuItem
                      startIcon={<TokenIcon name={symbol} />}
                      onSelect={() => setCurrencyId(id)}
                      textTransform="normal-case"
                    >
                      {symbol}
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

/** @internal */
const paths = [DEPOSIT_PATH, TRANSFER_PATH, WITHDRAW_PATH] as const;

/** @internal */
const icons = [
  <ArrowRightUp size="lg" />,
  <ArrowLeftRightLineIcon size="lg" />,
  <ArrowRightUp size="lg" className="rotate-90" />,
] as const;

/** @internal */
const actionItems = paths.map((path, idx) => ({
  label: capitalize(path),
  path: `/${BRIDGE_PATH}/${path}`,
  icon: icons[idx],
}));

/** @internal */
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

/** @internal */
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
