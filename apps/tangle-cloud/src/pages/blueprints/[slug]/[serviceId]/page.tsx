import { Navigate } from 'react-router';
import type { FC } from 'react';
import useParamWithSchema from '@tangle-network/tangle-shared-ui/hooks/useParamWithSchema';
import { z } from 'zod';
import BlueprintAppServicePage from '../../../../blueprintApps/components/BlueprintAppServicePage';
import BlueprintAppLandingPage from '../../../../blueprintApps/components/BlueprintAppLandingPage';
import {
  getBlueprintAppByCanonicalSlug,
  getBlueprintAppBySlug,
  isLegacyBlueprintIdParam,
} from '../../../../blueprintApps/registry';
import { PagePath } from '../../../../types';

const Page: FC = () => {
  const slug = useParamWithSchema('slug', z.string().min(1));
  const serviceId = useParamWithSchema('serviceId', z.string().min(1));

  if (!slug || !serviceId || isLegacyBlueprintIdParam(slug)) {
    return <Navigate to={PagePath.NOT_FOUND} replace />;
  }

  if (slug.startsWith('@')) {
    const scopedEntry = getBlueprintAppByCanonicalSlug(`${slug}/${serviceId}`);
    if (!scopedEntry) {
      return <Navigate to={PagePath.NOT_FOUND} replace />;
    }

    return <BlueprintAppLandingPage entry={scopedEntry} />;
  }

  const entry = getBlueprintAppBySlug(slug);
  if (!entry) {
    return <Navigate to={PagePath.NOT_FOUND} replace />;
  }

  return <BlueprintAppServicePage entry={entry} serviceId={serviceId} />;
};

export default Page;
