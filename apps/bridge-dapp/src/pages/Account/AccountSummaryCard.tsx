import { DropdownMenuTrigger as DropdownButton } from '@radix-ui/react-dropdown-menu';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import ArrowLeftRightLineIcon from '@webb-tools/icons/ArrowLeftRightLineIcon';
import { ArrowRightUp } from '@webb-tools/icons/ArrowRightUp';
import { ChevronDown } from '@webb-tools/icons/ChevronDown';
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
import { forwardRef, useEffect, useMemo, useState, type FC } from 'react';
import { useNavigate } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { formatEther } from 'viem';
import HiddenValue from '../../components/HiddenValue';
import HiddenValueEye from '../../components/HiddenValueEye';
import NoteAccountAvatarWithKey from '../../components/NoteAccountAvatarWithKey';
import {
  BRIDGE_PATH,
  DEPOSIT_PATH,
  TRANSFER_PATH,
  WITHDRAW_PATH,
} from '../../constants';
import useReceiveModal from '../../hooks/useReceiveModal';

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
          'relative rounded-2xl border-2 p-6',
          'border-mono-0 bg-mono-0/70 dark:border-mono-160 dark:bg-mono-0/5',
          'dark:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] dark:backdrop-blur-sm',
          'w-full lg:!w-fit flex items-center lg:h-[325px]',
          className
        )}
        ref={ref}
      >
        <div className="space-y-6">
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

        <Logo className="absolute bottom-0 right-0 rounded-br-2xl overflow-hidden" />
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

        <HiddenValueEye />
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
  const { toggleModal } = useReceiveModal();

  return (
    <div className="flex items-center gap-6">
      <ActionItem
        icon={<QRScanLineIcon size="lg" />}
        label="Receive"
        onClick={() => toggleModal()}
      />
      {actionItems.map(({ path, ...restItem }) => (
        <ActionItem key={path} {...restItem} onClick={() => navigate(path)} />
      ))}
    </div>
  );
}

/** @internal */
const Logo: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="215"
        height="199"
        viewBox="0 0 215 199"
        fill="none"
      >
        <g opacity="0.1">
          <path
            d="M97.7963 127.05V113.585C97.7963 104.907 104.9 97.7976 113.586 97.7976H127.046C135.724 97.7976 142.829 104.907 142.829 113.585V127.05C142.829 135.72 135.725 142.83 127.046 142.83H113.586C104.9 142.83 97.7963 135.72 97.7963 127.05Z"
            fill="white"
            stroke="white"
            stroke-width="1.24211"
          />
          <path
            d="M96.5552 71.7256C96.5552 84.5776 86.4541 94.9895 74.0545 94.9895C60.9367 94.9895 50.3186 105.99 50.3186 119.566C50.3186 132.417 40.212 142.83 27.7424 142.83C15.3498 142.83 5.24862 132.418 5.24862 119.566C5.24862 106.635 15.3509 96.2316 27.7424 96.2316C40.9332 96.2316 51.5607 85.2265 51.5607 71.7256C51.5607 58.2176 40.933 47.2197 27.7424 47.2197H21.0186C12.3928 47.2197 5.24862 39.8627 5.24862 30.9016V16.9392C5.24862 7.978 12.3928 0.621053 21.0186 0.621053L34.5349 0.621053C43.168 0.621053 50.3186 7.97852 50.3186 16.9392V23.9558C50.3186 37.4623 60.9379 48.4618 74.0545 48.4618C86.4542 48.4618 96.5552 58.8667 96.5552 71.7256Z"
            fill="white"
            stroke="white"
            stroke-width="1.24211"
          />
          <path
            d="M142.829 206.092V219.609C142.829 228.235 135.472 235.379 126.511 235.379H112.555C103.586 235.379 96.2287 228.234 96.2287 219.609V212.885C96.2287 199.694 85.2303 189.066 71.7217 189.066C58.22 189.066 47.2218 199.694 47.2218 212.885C47.2218 225.283 36.811 235.379 23.8789 235.379C11.0263 235.379 0.621053 225.285 0.621053 212.885C0.621053 200.415 11.028 190.309 23.8789 190.309C37.4552 190.309 48.4639 179.698 48.4639 166.573V159.849C48.4639 151.147 55.7437 144.072 64.7756 144.072H78.6678C87.707 144.072 94.9866 151.147 94.9866 159.849V166.573C94.9866 179.696 105.994 190.309 119.494 190.309H126.511C135.472 190.309 142.829 197.459 142.829 206.092Z"
            fill="white"
            stroke="white"
            stroke-width="1.24211"
          />
          <mask
            id="mask0_2913_16110"
            style={{ maskType: 'alpha' }}
            maskUnits="userSpaceOnUse"
            x="143"
            y="92"
            width="93"
            height="144"
          >
            <path
              d="M143.449 92.5488H235.998V236H143.449V92.5488Z"
              fill="white"
            />
          </mask>
          <g mask="url(#mask0_2913_16110)">
            <path
              d="M235.379 212.121C235.379 224.972 225.28 235.379 212.811 235.379C200.412 235.379 190.312 224.973 190.312 212.121C190.312 198.544 179.694 187.536 166.57 187.536H159.84C151.152 187.536 144.071 180.256 144.071 171.217V157.332C144.071 148.293 151.152 141.013 159.84 141.013H166.57C179.693 141.013 190.312 130.006 190.312 116.506C190.312 103.574 200.413 93.1699 212.811 93.1699C225.279 93.1699 235.379 103.575 235.379 116.506C235.379 129.357 225.28 139.771 212.811 139.771C199.688 139.771 189.069 150.771 189.069 164.278C189.069 177.778 199.688 188.778 212.811 188.778C225.278 188.778 235.379 199.19 235.379 212.121Z"
              fill="white"
              stroke="white"
              stroke-width="1.24211"
            />
          </g>
          <mask
            id="mask1_2913_16110"
            style={{ maskType: 'alpha' }}
            maskUnits="userSpaceOnUse"
            x="92"
            y="0"
            width="144"
            height="93"
          >
            <path d="M92.549 0L235.999 0V92.5492H92.549V0Z" fill="white" />
          </mask>
          <g mask="url(#mask1_2913_16110)">
            <path
              d="M235.381 16.3959V29.9174C235.381 38.5352 228.024 45.6854 219.055 45.6854H212.046C198.539 45.6854 187.539 56.3035 187.539 69.4254C187.539 81.8238 177.134 91.9302 164.275 91.9302C151.416 91.9302 141.011 81.8238 141.011 69.4254C141.011 56.3023 130.011 45.6854 116.434 45.6854H109.481C100.527 45.6854 93.1701 38.5355 93.1701 29.9174V16.3959C93.1701 7.7708 100.528 0.621053 109.481 0.621053L123.451 0.621053C132.412 0.621053 139.769 7.77097 139.769 16.3959V23.1875C139.769 36.3165 150.769 46.9275 164.275 46.9275C177.782 46.9275 188.782 36.3165 188.782 23.1875V16.3959C188.782 7.77097 196.139 0.621053 205.1 0.621053H219.055C228.024 0.621053 235.381 7.77113 235.381 16.3959Z"
              fill="white"
              stroke="white"
              stroke-width="1.24211"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
