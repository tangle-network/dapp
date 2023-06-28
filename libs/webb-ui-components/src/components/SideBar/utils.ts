export const pushToInternalLink = (href: string) => {
  const isHashRouting = window.location.hash.length > 0;

  if (isHashRouting) {
    // React
    window.location.hash = '#' + href;
  } else {
    // NextJS
    window.location.pathname = href;
  }
};

export const pushToExternalLink = (href: string) => {
  window.open(href, '_blank');
};
