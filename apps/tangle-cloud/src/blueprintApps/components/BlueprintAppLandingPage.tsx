import {
  Badge,
  Button,
  Card,
  CardContent,
} from '@tangle-network/sandbox-ui/primitives';
import type { FC } from 'react';
import { Link } from 'react-router';
import { resolveBlueprintAppView } from '../resolver';
import type { BlueprintAppEntry } from '../types';

type Props = {
  entry: BlueprintAppEntry;
};

const BlueprintAppLandingPage: FC<Props> = ({ entry }) => {
  const view = resolveBlueprintAppView(entry);
  const provisionPath =
    view.blueprintId !== undefined
      ? `/blueprints/${view.blueprintId.toString()}/deploy`
      : '/blueprints/create';
  const serviceNoun = view.manifest.resources.serviceNoun;
  const resourceNoun = view.manifest.resources.resourceNoun;

  return (
    <div data-sandbox-ui className="space-y-6">
      <Card variant="sandbox" className="overflow-hidden rounded-[32px]">
        <CardContent className="relative p-6 md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--brand-purple)]/20 blur-3xl" />

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-3xl space-y-4">
              <div className="space-y-2">
                <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.04em] text-white md:text-5xl">
                  {view.manifest.displayName}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/70">
                  {view.manifest.tagline}
                </p>
              </div>

              <p className="max-w-3xl text-base leading-7 text-white/82">
                {view.manifest.description}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg">
                  <Link to={provisionPath}>Create {serviceNoun}</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/blueprints">Browse blueprints</Link>
                </Button>
                {view.manifest.externalApp?.trust === 'trusted' && (
                  <Button asChild variant="secondary" size="lg">
                    <a
                      href={view.manifest.externalApp.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {view.manifest.externalApp.label ?? 'Publisher console'}
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-display text-xl font-extrabold tracking-tight text-white">
                Checkout path
              </h2>
              <div className="grid gap-3">
                <Step index="1" title={`Configure the ${serviceNoun}`} />
                <Step index="2" title="Choose registered operators" />
                <Step index="3" title={`Track ${resourceNoun} output`} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard
          title="Cloud service"
          description={`Create a ${serviceNoun}, choose operators, and submit the service order.`}
        />
        <SummaryCard
          title="Runtime visibility"
          description={`Monitor ${resourceNoun} records, events, and operator output from the same page.`}
        />
        <SummaryCard
          title="Safe checkout"
          description="Approve service requests from your wallet without embedding third-party code in the flow."
        />
      </div>
    </div>
  );
};

const Step = ({ index, title }: { index: string; title: string }) => (
  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
    <span className="grid h-7 w-7 place-items-center rounded-full bg-background text-xs font-bold text-foreground">
      {index}
    </span>
    <p className="text-sm font-semibold text-white/78">{title}</p>
  </div>
);

const SummaryCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <Card variant="sandbox" className="rounded-3xl">
    <CardContent className="space-y-3 p-6">
      <Badge variant="sandbox" className="w-fit">
        {title}
      </Badge>
      <p className="text-sm leading-6 text-white/66">{description}</p>
    </CardContent>
  </Card>
);

export default BlueprintAppLandingPage;
