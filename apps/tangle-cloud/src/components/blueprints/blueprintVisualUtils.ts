export const formatBlueprintName = (name: string) =>
  name.replace(/\s+Blueprint$/i, '').trim() || name;

export const getGithubPreviewUrl = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (isImageUrl(url)) {
      return value;
    }

    if (url.hostname !== 'github.com') {
      return null;
    }

    if (!isImagePath(url.pathname) || !url.pathname.includes('/raw/')) {
      return null;
    }

    return value;
  } catch {
    return null;
  }
};

export const getUsableMetadataImageUrl = (
  value?: string | null,
): string | null => {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (!isLoopbackHost(url.hostname)) {
      return value;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    return isLoopbackHost(window.location.hostname) ? value : null;
  } catch {
    return value;
  }
};

const isImageUrl = (url: URL) =>
  url.hostname === 'raw.githubusercontent.com' || isImagePath(url.pathname);

const isImagePath = (pathname: string) =>
  /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(pathname);

const isLoopbackHost = (hostname: string) =>
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '0.0.0.0' ||
  hostname === '::1';
