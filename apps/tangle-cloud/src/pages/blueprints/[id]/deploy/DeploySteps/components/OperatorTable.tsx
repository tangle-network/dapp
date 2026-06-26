import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  NativeCheckbox,
  Text,
} from '../../../../../../components/sandbox/SandboxUi';
import { FC, SetStateAction, useMemo } from 'react';
import { OperatorSelectionTable } from '../type';
import type { RowSelectionState } from '@tanstack/react-table';
import VaultsDropdown from '@tangle-network/tangle-shared-ui/components/tables/Operators/VaultsDropdown';
import { formatUnits } from 'viem';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';

const EMPTY_VALUE_PLACEHOLDER = '-';

const shortenAddress = (value: string) =>
  value.length > 14 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;

type Props = {
  tableData: OperatorSelectionTable[];
  enableRowSelection?: boolean;
  onRowSelectionChange?: (updater: SetStateAction<RowSelectionState>) => void;
  state?: {
    rowSelection?: RowSelectionState;
    columnFilters?: Array<{ id: string; value: unknown }>;
  };
  initialState?: unknown;
};

export const OperatorTable: FC<Props> = ({
  tableData,
  enableRowSelection,
  onRowSelectionChange,
  state,
}) => {
  const rowSelection = state?.rowSelection ?? {};
  const searchQuery =
    state?.columnFilters?.find((filter) => filter.id === 'address')?.value ??
    '';

  const rows = useMemo(() => {
    const normalizedSearch = String(searchQuery).trim().toLowerCase();
    const filteredRows = normalizedSearch
      ? tableData.filter((row) =>
          [row.address, row.identityName]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(normalizedSearch),
            ),
        )
      : tableData;

    return [...filteredRows].sort((a, b) => {
      const tvlDelta = (b.vaultTokensInUsd ?? 0) - (a.vaultTokensInUsd ?? 0);
      if (tvlDelta !== 0) return tvlDelta;

      return (b.instanceCount ?? 0) - (a.instanceCount ?? 0);
    });
  }, [searchQuery, tableData]);

  const toggleRow = (address: string) => {
    onRowSelectionChange?.((current) => {
      const next = { ...current };
      if (next[address]) {
        delete next[address];
      } else {
        next[address] = true;
      }

      return next;
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180/70">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Identity</TableHead>
            <TableHead>Self-Bonded</TableHead>
            <TableHead>Instances</TableHead>
            <TableHead>Stakers</TableHead>
            <TableHead>Delegated Assets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-10 text-center text-mono-100 dark:text-mono-80"
              >
                No operators match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const formattedSelfBonded = Number(
                formatUnits(
                  row.selfBondedAmount ?? BigInt(0),
                  TANGLE_TOKEN_DECIMALS,
                ),
              ).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              });
              const tokensList = row.vaultTokens ?? [];

              return (
                <TableRow key={row.address}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {enableRowSelection && (
                        <NativeCheckbox
                          checked={Boolean(rowSelection[row.address])}
                          onChange={() => toggleRow(row.address)}
                        />
                      )}
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-mono-60 dark:border-mono-170 bg-gradient-to-br from-primary/25 to-accent/25 font-mono text-xs text-mono-200 dark:text-mono-0">
                        {row.address.slice(2, 4).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Text variant="body1" className="truncate">
                          {row.identityName ?? shortenAddress(row.address)}
                        </Text>
                        {row.identityName && (
                          <Text
                            variant="body3"
                            className="font-mono text-mono-100 dark:text-mono-80"
                          >
                            {shortenAddress(row.address)}
                          </Text>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formattedSelfBonded} TNT</TableCell>
                  <TableCell>{row.instanceCount ?? 0}</TableCell>
                  <TableCell>{row.stakersCount ?? 0}</TableCell>
                  <TableCell>
                    {tokensList.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <span>
                          {`$${
                            row.vaultTokensInUsd
                              ? row.vaultTokensInUsd.toLocaleString()
                              : EMPTY_VALUE_PLACEHOLDER
                          }`}
                        </span>
                        <VaultsDropdown vaultTokens={tokensList} />
                      </div>
                    ) : (
                      <span className="text-mono-100 dark:text-mono-80">
                        No vaults
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
