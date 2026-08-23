/**
 * Utility to format image URLs (e.g. converting Google Drive links to direct viewable links)
 */
export function formatImageUrl(url: string | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();

  // If it's a Google Drive share link: https://drive.google.com/file/d/{ID}/view... or /open?id={ID}
  const driveMatch1 = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch1 && driveMatch1[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch1[1]}`;
  }

  const driveMatch2 = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveMatch2 && driveMatch2[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch2[1]}`;
  }

  const driveMatch3 = trimmed.match(/drive\.google\.com\/uc\?(?:export=view&)?id=([a-zA-Z0-9_-]+)/);
  if (driveMatch3 && driveMatch3[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch3[1]}`;
  }

  return trimmed;
}
