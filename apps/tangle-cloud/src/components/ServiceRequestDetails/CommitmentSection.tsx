import { FC, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { Address } from 'viem';
import { ExternalLinkLine, InformationLine } from '@tangle-network/icons';
import { Chip, Skeleton, Text } from '../sandbox/SandboxUi';
import {
  MembershipModel,
  getMembershipLabel,
  formatTtl,
  formatCreatedAt,
} from '../../types/serviceRequest';
import type { ServiceRequestVariant } from '@tangle-network/tangle-shared-ui/data/services';

const formatRequestVariantLabel = (variant: ServiceRequestVariant): string => {
  switch (variant) {
    case 'basic':
      return 'Basic';
    case 'exposure':
      return 'With Exposure';
    case 'security':
      return 'With Security';
    default:
      return 'Unknown';
  }
};

const shortenString = (value: string, chars = 6) =>
  value.length <= chars * 2 + 3
    ? value
    : `${value.slice(0, chars)}...${value.slice(-chars)}`;

const getRequestVariantTooltip = (variant: ServiceRequestVariant): string => {
  switch (variant) {
    case 'basic':
      return 'All operators are assigned 100% exposure by default.';
    case 'exposure':
      return 'The requester assigns a custom exposure percentage to each operator.';
    case 'security':
      return 'The requester defines per-asset security requirements with minimum and maximum exposure bounds. Operators must commit an exposure percentage for each required asset within those bounds to approve.';
    default:
      return 'Variant could not be resolved from on-chain calldata.';
  }
};

const formatBpsAsPercent = (bps: number): string => {
  return `${(bps / 100).toFixed(2)}%`;
};

const ModalSafeTooltip: FC<{ content: string }> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
    setIsVisible(true);
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center cursor-default text-muted-foreground"
      >
        <InformationLine />
      </span>

      {isVisible &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: 'translate(-50%, -100%)',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            className="inline-flex items-center rounded px-3 py-2 bg-popover border border-border shadow-sm"
          >
            <span className="text-xs text-muted-foreground font-normal text-center break-normal min-w-0 max-w-[250px]">
              {content}
            </span>
          </div>,
          document.body,
        )}
    </>
  );
};

type Props = {
  ttl: bigint | undefined;
  createdAt: bigint | undefined;
  membership: MembershipModel | undefined;
  minOperators: number | undefined;
  maxOperators: number | undefined;
  totalOperators: number;
  requestVariant: ServiceRequestVariant;
  requestedExposureBps: number[] | null;
  requestedOperators: Address[] | null;
  operatorCandidates: Address[];
  isLoading: boolean;
  blueprintId?: bigint;
  blueprintName?: string;
  currentOperator?: Address;
};

const CommitmentSection: FC<Props> = ({
  ttl,
  createdAt,
  membership,
  minOperators,
  maxOperators: _maxOperators,
  totalOperators,
  requestVariant,
  requestedExposureBps,
  requestedOperators,
  operatorCandidates,
  isLoading,
  blueprintId,
  currentOperator,
  blueprintName,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Text variant="h5" className="text-foreground">
          Service Configuration
        </Text>

        <div className="space-y-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    );
  }

  const durationText = ttl !== undefined ? formatTtl(ttl) : '-';
  const createdText =
    createdAt !== undefined ? formatCreatedAt(createdAt) : '-';

  // For Fixed: all operators required. For Dynamic: use minOperators.
  const minApprovalsRequired =
    membership === MembershipModel.Fixed
      ? totalOperators
      : (minOperators ?? totalOperators);

  const hasExposureValues =
    requestVariant === 'exposure' &&
    Array.isArray(requestedExposureBps) &&
    requestedExposureBps.length > 0;

  const exposureRows = hasExposureValues
    ? requestedExposureBps.map((exposureBps, index) => {
        const rawAddress =
          requestedOperators?.[index] ?? operatorCandidates[index];
        const operatorLabel = rawAddress
          ? shortenString(rawAddress, 6)
          : `Operator #${index + 1}`;
        const isCurrentOperator =
          rawAddress !== undefined &&
          currentOperator !== undefined &&
          rawAddress.toLowerCase() === currentOperator.toLowerCase();
        return { operatorLabel, exposureBps, isCurrentOperator };
      })
    : [];

  return (
    <div className="space-y-2">
      <Text variant="h5" className="text-foreground">
        Service Configuration
      </Text>

      <div className="space-y-1">
        {blueprintId !== undefined && blueprintName && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Blueprint:</span>

            <Link
              to={`/blueprints/${blueprintId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 hover:underline"
            >
              {blueprintName}
              <ExternalLinkLine className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Duration:</span>
          <span className="text-sm font-semibold">{durationText}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Created:</span>
          <span className="text-sm font-semibold">{createdText}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Membership:</span>
          <Chip
            color={membership === MembershipModel.Fixed ? 'blue' : 'purple'}
          >
            {membership !== undefined ? getMembershipLabel(membership) : '-'}
          </Chip>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Min. Approvals Required:
          </span>
          <span className="text-sm font-semibold">{minApprovalsRequired}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Request Type:</span>
          <span className="text-sm font-semibold">
            {formatRequestVariantLabel(requestVariant)}
          </span>
          <ModalSafeTooltip
            content={getRequestVariantTooltip(requestVariant)}
          />
        </div>

        {hasExposureValues && (
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">
              Per-Operator Exposure (%):
            </span>
            <div className="space-y-1">
              {exposureRows.map((entry, index) => (
                <div
                  key={`${index}-${entry.operatorLabel}-${entry.exposureBps}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    {entry.operatorLabel}
                    {entry.isCurrentOperator && (
                      <span className="text-primary">(You)</span>
                    )}
                  </span>
                  <span className="font-semibold">
                    {formatBpsAsPercent(entry.exposureBps)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitmentSection;
