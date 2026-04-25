const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

const isPrivateIpv4 = (hostname: string): boolean => {
  const parts = hostname.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return false;
  }

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254)
  );
};

export const getBrowserHostname = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.location.hostname;
};

export const isLocalPreviewHost = (
  hostname = getBrowserHostname(),
): boolean => {
  if (import.meta.env.VITE_FORCE_LOCAL_CHAIN === 'true') {
    return true;
  }

  if (!hostname) {
    return false;
  }

  return LOCAL_HOSTNAMES.has(hostname) || isPrivateIpv4(hostname);
};

export const getBrowserLocalServiceUrl = (
  port: number,
  pathname = '',
): string => {
  const hostname = getBrowserHostname();
  const resolvedHost =
    hostname && isLocalPreviewHost(hostname) ? hostname : 'localhost';

  return `http://${resolvedHost}:${port}${pathname}`;
};

export const rewriteLocalhostUrlForBrowser = (value: string): string => {
  const hostname = getBrowserHostname();
  if (
    !hostname ||
    !isLocalPreviewHost(hostname) ||
    LOCAL_HOSTNAMES.has(hostname)
  ) {
    return value;
  }

  try {
    const url = new URL(value);
    if (!LOCAL_HOSTNAMES.has(url.hostname)) {
      return value;
    }

    url.hostname = hostname;
    return url.toString();
  } catch {
    return value;
  }
};
