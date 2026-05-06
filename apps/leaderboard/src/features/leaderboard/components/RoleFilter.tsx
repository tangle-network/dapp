import { Button, Typography } from '@tangle-network/ui-components';
import cx from 'classnames';
import { FC } from 'react';
import {
  RoleFilterEnum,
  ROLE_FILTER_ICONS,
  ROLE_FILTER_LABELS,
} from '../constants';

interface RoleFilterProps {
  selectedRoles: RoleFilterEnum[];
  onRoleToggle: (role: RoleFilterEnum) => void;
  onClearAll: () => void;
  isLoading?: boolean;
  roleCounts?: {
    operators: number;
    stakers: number;
    developers: number;
    customers: number;
  };
}

const ROLES = Object.values(RoleFilterEnum);

export const RoleFilter: FC<RoleFilterProps> = ({
  selectedRoles,
  onRoleToggle,
  onClearAll,
  isLoading,
  roleCounts,
}) => {
  const getRoleCount = (role: RoleFilterEnum): number | undefined => {
    if (!roleCounts) return undefined;

    switch (role) {
      case RoleFilterEnum.OPERATOR:
        return roleCounts.operators;
      case RoleFilterEnum.STAKER:
        return roleCounts.stakers;
      case RoleFilterEnum.DEVELOPER:
        return roleCounts.developers;
      case RoleFilterEnum.CUSTOMER:
        return roleCounts.customers;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Typography variant="body2" className="text-mono-100 dark:text-mono-100">
        Filter by role:
      </Typography>

      {ROLES.map((role) => {
        const isSelected = selectedRoles.includes(role);
        const count = getRoleCount(role);

        return (
          <button
            key={role}
            onClick={() => onRoleToggle(role)}
            disabled={isLoading}
            className={cx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
              'transition-all duration-150 ease-in-out',
              'border',
              isSelected
                ? 'bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'bg-mono-20 dark:bg-mono-180 border-mono-60 dark:border-mono-140',
              'hover:border-blue-400 hover:bg-blue-500/10',
              isLoading && 'opacity-50 cursor-not-allowed',
            )}
          >
            <span>{ROLE_FILTER_ICONS[role]}</span>
            <span>{ROLE_FILTER_LABELS[role]}</span>
            {count !== undefined && (
              <span
                className={cx(
                  'px-1.5 py-0.5 rounded-full text-xs',
                  isSelected ? 'bg-blue-500/30' : 'bg-mono-40 dark:bg-mono-160',
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}

      {selectedRoles.length > 0 && (
        <Button
          variant="utility"
          size="sm"
          onClick={onClearAll}
          className="ml-2"
        >
          Clear
        </Button>
      )}
    </div>
  );
};
