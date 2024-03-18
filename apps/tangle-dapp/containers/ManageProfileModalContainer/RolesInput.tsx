import { Close } from '@webb-tools/icons';
import {
  CheckBox,
  Chip,
  SkeletonLoader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import usePolkadotApi from '../../hooks/usePolkadotApi';
import { ServiceType } from '../../types';
import {
  getChartDataAreaColorByServiceType,
  getChipColorOfServiceType,
} from '../../utils';
import { formatTokenBalance } from '../../utils/polkadot/tokens';
import BaseInput from './BaseInput';

export type RolesInputProps = {
  title: string;
  id: string;
  selectedRoles: ServiceType[];
  roles: ServiceType[];
  onToggleRole: (role: ServiceType) => void;
};

const RolesInput: FC<RolesInputProps> = ({
  title,
  id,
  selectedRoles,
  roles,
  onToggleRole,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { minRestakingBond } = useRestakingLimits();

  const { value: maxRolesPerAccount } = usePolkadotApi(
    useCallback(
      (api) => Promise.resolve(api.consts.roles.maxRolesPerAccount),
      []
    )
  );

  const canSelectMoreRoles =
    maxRolesPerAccount !== null && maxRolesPerAccount.gtn(selectedRoles.length);

  const dropdownBody = useMemo(
    () =>
      roles
        // Sort roles in ascending order, by their display
        // values (strings). This is done with the intent to
        // give priority to the TSS roles.
        .toSorted((a, b) => a.localeCompare(b))
        .map((role) => (
          <div
            key={role}
            onClick={() => {
              if (canSelectMoreRoles || selectedRoles.includes(role)) {
                onToggleRole(role);
              }
            }}
            className={twMerge(
              'flex items-center justify-between rounded-lg p-2  hover:bg-mono-20 dark:hover:bg-mono-160',
              canSelectMoreRoles || selectedRoles.includes(role)
                ? 'cursor-pointer'
                : 'cursor-not-allowed'
            )}
          >
            <div className="flex items-center justify-center gap-3">
              <CheckBox
                inputProps={{
                  readOnly: true,
                }}
                isDisabled={
                  !canSelectMoreRoles && !selectedRoles.includes(role)
                }
                isChecked={selectedRoles.includes(role)}
                wrapperClassName="flex justify-center items-center min-h-auto"
              />

              <div className="flex gap-1 items-center justify-center">
                <Dot role={role} />

                <Typography
                  variant="body2"
                  fw="normal"
                  className="dark:text-mono-0"
                >
                  {role}
                </Typography>
              </div>
            </div>

            {minRestakingBond !== null ? (
              <Chip
                className="text-center whitespace-nowrap"
                color="dark-grey"
              >{`≥ ${formatTokenBalance(minRestakingBond, false)}`}</Chip>
            ) : (
              <SkeletonLoader />
            )}
          </div>
        )),
    [canSelectMoreRoles, minRestakingBond, onToggleRole, roles, selectedRoles]
  );

  return (
    <BaseInput
      title={title}
      id={id}
      dropdownBody={dropdownBody}
      isDropdownVisible={isDropdownVisible}
      setIsDropdownVisible={setIsDropdownVisible}
      bodyClassName="flex flex-wrap gap-1"
    >
      {selectedRoles.map((role) => (
        <Chip
          key={role}
          color={getChipColorOfServiceType(role)}
          className="cursor-pointer flex items-center justify-center gap-0"
          onClick={() => onToggleRole(role)}
        >
          {role}
          <Close />
        </Chip>
      ))}

      {selectedRoles.length === 0 && (
        <Chip
          onClick={() => setIsDropdownVisible(true)}
          color="dark-grey"
          className="cursor-pointer"
        >
          Select Role(s)
        </Chip>
      )}
    </BaseInput>
  );
};

type DotProps = {
  role: ServiceType;
};

/** @internal */
const Dot: FC<DotProps> = ({ role }) => {
  const color = getChartDataAreaColorByServiceType(role);

  return (
    <div
      style={{ backgroundColor: color }}
      className="rounded-full w-[6px] h-[6px]"
    />
  );
};

export default RolesInput;
