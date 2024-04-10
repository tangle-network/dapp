import { Close, LockLineIcon } from '@webb-tools/icons';
import { CheckBox, Chip, Typography } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import BaseInput from '../../../components/AmountInput/BaseInput';
import useRestakingJobs from '../../../data/restaking/useRestakingJobs';
import usePolkadotApi from '../../../hooks/usePolkadotApi';
import { RestakingService } from '../../../types';
import {
  getChartDataAreaColorByServiceType,
  getChipColorOfServiceType,
} from '../../../utils';
import InputAction from '../InputAction';

export type SharedRolesInputProps = {
  title: string;
  id: string;
  selectedServices: RestakingService[];
  services: RestakingService[];
  onToggleRole: (role: RestakingService) => void;
};

const SharedRolesInput: FC<SharedRolesInputProps> = ({
  title,
  id,
  selectedServices,
  services,
  onToggleRole,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { servicesWithJobs } = useRestakingJobs();

  const { value: maxRolesPerAccount } = usePolkadotApi(
    useCallback(
      (api) => Promise.resolve(api.consts.roles.maxRolesPerAccount),
      []
    )
  );

  const canSelectMoreRoles =
    maxRolesPerAccount !== null &&
    maxRolesPerAccount.gtn(selectedServices.length);

  const handleDeselectService = useCallback(
    (service: RestakingService) => {
      // Ignore the request if it is not known which services
      // have active jobs, or if the requested service has an
      // active job.
      if (servicesWithJobs === null || servicesWithJobs.includes(service)) {
        return;
      }

      onToggleRole(service);
    },
    [onToggleRole, servicesWithJobs]
  );

  const handleSelectService = useCallback(
    (service: RestakingService) => {
      if (!canSelectMoreRoles || selectedServices.includes(service)) {
        return;
      }

      onToggleRole(service);
    },
    [canSelectMoreRoles, onToggleRole, selectedServices]
  );

  const determineIfLocked = useCallback(
    (service: RestakingService): boolean =>
      (!canSelectMoreRoles && !selectedServices.includes(service)) ||
      // Mark all services as locked by default, until the services
      // with active jobs array loads to prevent the user from somehow
      // modifying them.
      servicesWithJobs === null ||
      // Cannot remove roles with active jobs.
      servicesWithJobs.includes(service),
    [canSelectMoreRoles, selectedServices, servicesWithJobs]
  );

  const dropdownBody = useMemo(
    () =>
      services
        // Sort roles in ascending order, by their display
        // values (strings). This is done with the intent to
        // give priority to the TSS roles.
        .toSorted((a, b) => a.localeCompare(b))
        .map((service) => {
          const isLocked = determineIfLocked(service);

          return (
            <div
              key={service}
              onClick={() => {
                if (selectedServices.includes(service)) {
                  handleDeselectService(service);
                } else {
                  handleSelectService(service);
                }
              }}
              className={twMerge(
                'flex items-center justify-between rounded-lg p-2  hover:bg-mono-20 dark:hover:bg-mono-160',
                !isLocked ? 'cursor-pointer' : 'cursor-not-allowed'
              )}
            >
              <div className="flex items-center justify-center gap-3">
                <CheckBox
                  wrapperClassName="flex justify-center items-center min-h-auto"
                  isChecked={selectedServices.includes(service)}
                  isDisabled={isLocked}
                  inputProps={{
                    readOnly: true,
                  }}
                />

                <div className="flex gap-1 items-center justify-center">
                  <Dot role={service} />

                  <Typography
                    variant="body2"
                    fw="normal"
                    className="dark:text-mono-0"
                  >
                    {service}
                  </Typography>
                </div>
              </div>
            </div>
          );
        }),
    [
      services,
      determineIfLocked,
      selectedServices,
      handleDeselectService,
      handleSelectService,
    ]
  );

  // Display a notice if there are services with active
  // jobs, that cannot be removed.
  const lockedServicesNoticeInputAction =
    servicesWithJobs !== null && servicesWithJobs.length > 0 ? (
      <InputAction
        tooltip="Some roles cannot be removed because there are active jobs for them."
        Icon={LockLineIcon}
        iconSize="md"
      />
    ) : undefined;

  return (
    <BaseInput
      title={title}
      id={id}
      actions={lockedServicesNoticeInputAction}
      dropdownBody={dropdownBody}
      isDropdownVisible={isDropdownVisible}
      setIsDropdownVisible={setIsDropdownVisible}
      bodyClassName="flex flex-wrap gap-1"
    >
      {selectedServices.map((service) => {
        const isLocked = determineIfLocked(service);

        return (
          <Chip
            key={service}
            color={getChipColorOfServiceType(service)}
            className={twMerge(
              'flex items-center justify-center gap-0 cursor-pointer',
              isLocked && 'cursor-not-allowed'
            )}
            onClick={() => handleDeselectService(service)}
          >
            {service}

            {!isLocked && <Close />}
          </Chip>
        );
      })}

      {selectedServices.length === 0 && (
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
  role: RestakingService;
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

export default SharedRolesInput;
