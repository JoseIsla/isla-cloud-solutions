/**
 * Derives the normalized thumbnail URL for a logo uploaded via the backend.
 * Backend convention: alongside `name.png` we write `name-thumb.png`.
 * Falls back to the original URL if it's not a raster we control.
 */
export const toLogoThumb = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  // Already a thumb
  if (/-thumb\.(png|jpe?g|webp)(\?|$)/i.test(url)) return url;
  // Only rewrite local /uploads/ raster files
  if (!/\/uploads\//.test(url)) return url;
  if (!/\.(png|jpe?g)(\?|$)/i.test(url)) return url;
  return url.replace(/\.(png|jpe?g)(\?|$)/i, "-thumb.png$2");
};
