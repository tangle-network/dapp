import { Button, Card, Typography } from '@tangle-network/ui-components';
import type { FC } from 'react';
import { Link } from 'react-router';
import {
  getBlueprintPublisherVerificationLabel,
  getBlueprintExperienceTierLabel,
  getExternalAppTrustLabel,
  getBlueprintPath,
  getBlueprintSlugPolicyLabel,
  getBlueprintSurfaceLabel,
  resolveBlueprintAppView,
} from '../resolver';
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

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl p-6 md:p-8">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-full border border-mono-160/10 bg-mono-0/[0.05] px-3 py-1">
              <Typography variant="body3" className="text-mono-80">
                {getBlueprintExperienceTierLabel(view.tier)}
              </Typography>
            </div>

            <div className="inline-flex rounded-full border border-mono-160/10 bg-mono-0/[0.05] px-3 py-1">
              <Typography variant="body3" className="text-mono-80">
                {getBlueprintSlugPolicyLabel(view.slugPolicy)}
              </Typography>
            </div>

            <div className="inline-flex rounded-full border border-mono-160/10 bg-mono-0/[0.05] px-3 py-1">
              <Typography variant="body3" className="text-mono-80">
                {getBlueprintPublisherVerificationLabel(
                  view.publisher.verification,
                )}
              </Typography>
            </div>

            {view.manifest.externalApp && (
              <div className="inline-flex rounded-full border border-mono-160/10 bg-mono-0/[0.05] px-3 py-1">
                <Typography variant="body3" className="text-mono-80">
                  {getExternalAppTrustLabel(view.manifest.externalApp.trust)}
                </Typography>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Typography variant="h2" fw="bold">
              {view.manifest.displayName}
            </Typography>
            <Typography variant="body1" className="text-mono-80 max-w-2xl">
              {view.manifest.tagline}
            </Typography>
          </div>

          <Typography variant="body1" className="text-mono-100 max-w-3xl">
            {view.manifest.description}
          </Typography>

          <div className="flex flex-wrap gap-2 pt-1">
            {view.manifest.surfaces.map((surface) => (
              <span
                key={surface}
                className="rounded-full border border-mono-160/10 bg-mono-0/[0.05] px-3 py-1 text-xs text-mono-100"
              >
                {getBlueprintSurfaceLabel(surface)}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to={provisionPath}>
              <Button>Provision {view.manifest.resources.serviceNoun}</Button>
            </Link>
            <Link to="/blueprints">
              <Button variant="secondary">Browse all blueprints</Button>
            </Link>
            {view.manifest.externalApp &&
              (view.manifest.externalApp.trust === 'trusted' ? (
                <a
                  href={view.manifest.externalApp.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="secondary">
                    {view.manifest.externalApp.label ?? 'Open external app'}
                  </Button>
                </a>
              ) : (
                <Button variant="secondary" isDisabled>
                  External app pending trust review
                </Button>
              ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl p-6">
          <section className="space-y-3">
            <Typography variant="h4" fw="bold">
              Blueprint root
            </Typography>
            <div className="space-y-3">
              <Typography variant="body2" className="text-mono-100">
                <span className="font-semibold text-mono-0">
                  {getBlueprintPath(view)}
                </span>{' '}
                is the blueprint homepage: provisioning entrypoint, public
                instance explorer, generic protocol UI, and the default
                launchpad for this app.
              </Typography>
              <Typography variant="body2" className="text-mono-100">
                <span className="font-semibold text-mono-0">
                  {view.tier === 'generic'
                    ? `${getBlueprintPath(view)}/services/:serviceId`
                    : `${getBlueprintPath(view)}/:serviceId`}
                </span>{' '}
                resolves a live {view.manifest.resources.serviceNoun} instance,
                with nested resource routes for{' '}
                {view.manifest.resources.resourceNoun}
                {view.manifest.resources.resourceNoun.endsWith('s') ? '' : 's'},
                plus chat, vaults, and runtime-specific surfaces when declared.
              </Typography>
            </div>
          </section>
        </Card>

        <Card className="rounded-3xl p-6">
          <aside className="space-y-3">
            <Typography variant="h4" fw="bold">
              Trust contract
            </Typography>
            <Typography variant="body2" className="text-mono-100">
              Published by {view.publisher.label}. Tangle Cloud always keeps a
              protocol-controlled fallback UI, then layers declarative metadata,
              curated modules, or external app handoff on top as the blueprint
              earns more trust.
            </Typography>
            {view.manifest.externalApp?.trust === 'restricted' && (
              <Typography variant="body2" className="text-mono-100">
                External app handoff is withheld because{' '}
                {view.manifest.externalApp.reason?.toLowerCase() ??
                  'the host has not passed trust review yet'}
                . The protocol-controlled surface stays available either way.
              </Typography>
            )}
          </aside>
        </Card>
      </div>
    </div>
  );
};

export default BlueprintAppLandingPage;
