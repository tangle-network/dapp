export const getYouTubeThumbnailUri = (videoLink: string) => {
  const videoIdMatch = videoLink.match(/v=([^&]+)/);
  if (!videoIdMatch) {
    return null; // Invalid video link
  }
  const videoId = videoIdMatch[1];
  const thumbnailUri = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  return thumbnailUri;
};
