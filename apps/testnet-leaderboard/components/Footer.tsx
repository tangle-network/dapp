'use client';

import { WebsiteFooter } from '@webb-tools/webb-ui-components/components/WebsiteFooter';
import { type ComponentProps, type ElementRef, forwardRef } from 'react';

const Footer = forwardRef<ElementRef<'footer'>, ComponentProps<'footer'>>(
  (props, ref) => {
    return (
      <WebsiteFooter {...props} websiteType="tangle" ref={ref} hideNewsletter />
    );
  }
);

Footer.displayName = 'Footer';

export default Footer;
