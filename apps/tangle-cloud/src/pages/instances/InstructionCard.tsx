import {
  ComponentProps,
  createElement,
  type ComponentType,
  type FC,
  type SVGProps,
  useMemo,
} from 'react';
import { Link as RouterLink } from 'react-router';
import { useAccount } from 'wagmi';
import TangleCloudCard from '../../components/TangleCloudCard';
import { CLOUD_INSTRUCTIONS } from '../../constants/cloudInstruction';
import {
  ArrowRightUp,
  BookOpenLineIcon,
  CheckboxCircleFill,
  GlobalLine,
  TimeLineIcon,
} from '@tangle-network/icons';
import { GridFillIcon } from '@tangle-network/icons/GridFillIcon';
import { Badge } from '@tangle-network/sandbox-ui/primitives';
import useEvmOperatorInfo from '../../hooks/useEvmOperatorInfo';
import useOperatorStats from '../../data/operators/useOperatorStats';
import useUserStats from '../../data/operators/useUserStats';
import { PagePath } from '../../types';

type InstructionCardProps = {
  rootProps?: ComponentProps<typeof TangleCloudCard>;
  refreshTrigger?: number;
};

type NextStep = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  to: string;
  external?: boolean;
  tone: 'action' | 'info' | 'success';
  count?: number;
};

// Wallet-connected: derive next-step rows from real account state so the card
// reads as 'here is what to do right now' instead of 'three static onboarding
// links'. Pending approvals lead because they're action-required; success
// states get a checkmark, not an arrow.
const buildConnectedSteps = (params: {
  isOperator: boolean;
  pendingApprovals: number;
  runningServices: number;
  registeredBlueprints: number;
  deployedServices: number;
}): NextStep[] => {
  const steps: NextStep[] = [];

  if (params.pendingApprovals > 0) {
    steps.push({
      title: `Approve ${params.pendingApprovals} service ${
        params.pendingApprovals === 1 ? 'request' : 'requests'
      }`,
      description:
        'Operators must approve incoming requests for the service to activate.',
      icon: TimeLineIcon,
      to: PagePath.INSTANCES,
      tone: 'action',
      count: params.pendingApprovals,
    });
  }

  if (params.isOperator && params.registeredBlueprints === 0) {
    steps.push({
      title: 'Register operator capacity',
      description:
        'You are an operator with no blueprint registrations. Attach to blueprints to start earning.',
      icon: GlobalLine,
      to: PagePath.BLUEPRINTS,
      tone: 'action',
    });
  }

  if (!params.isOperator && params.deployedServices === 0) {
    steps.push({
      title: 'Deploy your first service instance',
      description:
        'Pick a blueprint with operators online, submit the request, and wait for activation.',
      icon: GridFillIcon,
      to: PagePath.BLUEPRINTS,
      tone: 'action',
    });
  }

  if (params.runningServices > 0) {
    steps.push({
      title: `${params.runningServices} ${
        params.runningServices === 1 ? 'service' : 'services'
      } running`,
      description:
        'Job submissions and runtime records are available on the service page.',
      icon: CheckboxCircleFill,
      to: PagePath.INSTANCES,
      tone: 'success',
      count: params.runningServices,
    });
  }

  // Always include docs as the trailing reference link
  steps.push({
    title: 'Implementation docs',
    description: 'Blueprint, operator, and service-instance references.',
    icon: BookOpenLineIcon,
    to: 'https://docs.tangle.tools/developers/blueprints/introduction',
    external: true,
    tone: 'info',
  });

  return steps;
};

const TONE_STYLES: Record<NextStep['tone'], { icon: string; chip: string }> = {
  action: {
    icon: 'fill-amber-400',
    chip: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  },
  success: {
    icon: 'fill-emerald-400',
    chip: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  },
  info: {
    icon: 'fill-primary',
    chip: 'border-mono-60 dark:border-mono-170 bg-mono-20 dark:bg-mono-190 text-mono-100 dark:text-mono-60',
  },
};

export const InstructionCard: FC<InstructionCardProps> = ({
  rootProps,
  refreshTrigger,
}) => {
  const { address, isConnected } = useAccount();
  const { isOperator, operatorAddress } = useEvmOperatorInfo();
  const { result: operatorStats } = useOperatorStats(
    isOperator ? (operatorAddress ?? undefined) : undefined,
    refreshTrigger,
  );
  const { result: userStats } = useUserStats(address, refreshTrigger);

  const steps = useMemo<NextStep[]>(() => {
    if (!isConnected || !userStats) {
      // Disconnected / not-yet-loaded: fall back to the onboarding triplet
      return CLOUD_INSTRUCTIONS.map((instruction) => ({
        title: instruction.title,
        description: instruction.description,
        icon: instruction.icon,
        to: instruction.to,
        external: instruction.external,
        tone: 'info' as const,
      }));
    }

    return buildConnectedSteps({
      isOperator,
      pendingApprovals: operatorStats?.pendingServices ?? 0,
      runningServices:
        (operatorStats?.runningServices ?? 0) || userStats.runningServices,
      registeredBlueprints: operatorStats?.registeredBlueprints ?? 0,
      deployedServices: userStats.deployedServices,
    });
  }, [isConnected, isOperator, operatorStats, userStats]);

  const heading = isConnected ? 'Next steps' : 'Quick actions';
  const subheading = isConnected
    ? 'Items inferred from your connected wallet state.'
    : 'Common starting points for new operators and customers.';

  return (
    <TangleCloudCard {...rootProps}>
      <div className="flex flex-col gap-4">
        <div>
          <Badge variant="outline">{heading}</Badge>
          <div className="mt-3 font-display font-bold text-mono-200 dark:text-mono-0 text-lg tracking-tight">
            {isConnected ? 'For your account' : 'Quick Actions'}
          </div>
          <p className="mt-1 text-mono-100 dark:text-mono-60 text-xs">
            {subheading}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {steps.map((step) => {
            const tone = TONE_STYLES[step.tone];
            const content = (
              <div className="group flex cursor-pointer items-center gap-4 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-20 dark:bg-mono-190 p-4 transition-colors duration-200 hover:border-purple-40/40 hover:bg-mono-20/60 dark:bg-mono-190/60">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-mono-60 dark:border-mono-170 bg-[var(--bg-mono-0 dark:bg-mono-180)] transition-colors duration-200 group-hover:border-purple-40/40">
                  {createElement(step.icon, {
                    className: `h-5 w-5 ${tone.icon}`,
                  })}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-bold text-mono-200 dark:text-mono-0 text-sm transition-colors duration-200 group-hover:text-purple-40">
                      {step.title}
                    </h3>
                    {step.count !== undefined && step.count > 0 && (
                      <span
                        className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${tone.chip}`}
                      >
                        {step.count}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-mono-100 dark:text-mono-60 text-sm">
                    {step.description}
                  </p>
                </div>

                {step.external && (
                  <ArrowRightUp className="h-5 w-5 shrink-0 fill-muted-foreground transition-colors duration-200 group-hover:fill-primary" />
                )}
              </div>
            );

            if (step.external) {
              return (
                <a
                  key={step.title}
                  href={step.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline hover:no-underline"
                >
                  {content}
                </a>
              );
            }

            return (
              <RouterLink
                key={step.title}
                to={step.to}
                className="no-underline hover:no-underline"
              >
                {content}
              </RouterLink>
            );
          })}
        </div>
      </div>
    </TangleCloudCard>
  );
};

InstructionCard.displayName = 'InstructionCard';
