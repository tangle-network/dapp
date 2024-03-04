import { Close } from '@webb-tools/icons';
import {
  CheckBox,
  Chip,
  SkeletonLoader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback } from 'react';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import { ServiceType } from '../../types';
import { getChipColorByServiceType } from '../../utils';
import { formatTokenBalance } from '../../utils/polkadot/tokens';
import BaseInput from './BaseInput';
import { getServiceChartColor } from './IndependentAllocationStep';

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
  const { data: minRestakingBond } = usePolkadotApiRx(
    useCallback((api) => api.query.roles.minRestakingBond(), [])
  );

  const dropdownBody = roles.map((role) => (
    <div
      key={role}
      onClick={() => onToggleRole(role)}
      className="flex items-center justify-between p-2 cursor-pointer"
    >
      <div className="flex items-center justify-center gap-2">
        <CheckBox
          inputProps={{
            readOnly: true,
          }}
          isChecked={selectedRoles.includes(role)}
        />

        <Dot role={role} />

        <Typography variant="body2" fw="normal" className="dark:text-mono-0">
          {role}
        </Typography>
      </div>

      {minRestakingBond !== null ? (
        <Chip color="dark-grey">{`≥ ${formatTokenBalance(
          minRestakingBond
        )}`}</Chip>
      ) : (
        <SkeletonLoader />
      )}
    </div>
  ));

  return (
    <BaseInput
      title={title}
      id={id}
      dropdownBody={dropdownBody}
      bodyClassName="flex flex-wrap gap-1"
    >
      {selectedRoles.map((role) => (
        <Chip
          key={role}
          color={getChipColorByServiceType(role)}
          className="cursor-pointer"
          onClick={() => onToggleRole(role)}
        >
          {role}
          <Close />
        </Chip>
      ))}

      {selectedRoles.length === 0 && (
        <Chip color="dark-grey">Select Role(s)</Chip>
      )}
    </BaseInput>
  );
};

type DotProps = {
  role: ServiceType;
};

/** @internal */
const Dot: FC<DotProps> = ({ role }) => {
  const color = getServiceChartColor(role);

  return (
    <div
      style={{ backgroundColor: color }}
      className="rounded-full w-[6px] h-[6px]"
    />
  );
};

export default RolesInput;
