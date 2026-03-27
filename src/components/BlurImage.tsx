import { useState, useRef, useEffect, ImgHTMLAttributes } from "react";

interface BlurImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "onLoad"> {
  /** Solid-color placeholder shown while loading */
  placeholderColor?: string;
  /** Extra wrapper classes */
  wrapperClassName?: string;
  /** Explicit WebP source URL (auto-generated from src if omitted) */
  webpSrc?: string;
  /** Disable automatic WebP source generation */
  noWebp?: boolean;
}

/**
 * Generates a WebP URL variant from a JPG/PNG URL.
 * Works for both local assets and remote URLs.
 */
const toWebpUrl = (url: string): string | null => {
  if (!url) return null;
  // Already webp — no fallback needed
  if (/\.webp(\?|$)/i.test(url)) return null;
  // Only convert known raster formats
  if (/\.(jpe?g|png)(\?|$)/i.test(url)) {
    return url.replace(/\.(jpe?g|png)/i, ".webp");
  }
  return null;
};

/**
 * Image component with:
 * - Blur-up placeholder effect
 * - IntersectionObserver lazy loading
 * - Automatic WebP with <picture> fallback for older browsers
 */
const BlurImage = ({
  src,
  alt = "",
  className = "",
  wrapperClassName = "",
  placeholderColor,
  webpSrc,
  noWebp = false,
  style,
  ...rest
}: BlurImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const resolvedSrc = inView ? src : undefined;
  const resolvedWebp = !noWebp && inView ? (webpSrc || (src ? toWebpUrl(src) : null)) : null;

  const imgClasses = `transition-all duration-700 ease-out ${
    loaded ? "blur-0 scale-100 opacity-100" : "blur-md scale-105 opacity-0"
  } ${className}`;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${wrapperClassName}`}
      style={{
        backgroundColor: placeholderColor || "hsl(var(--muted))",
      }}
    >
      {resolvedWebp ? (
        <picture>
          <source srcSet={resolvedWebp} type="image/webp" />
          <img
            src={resolvedSrc}
            alt={alt}
            className={imgClasses}
            style={style}
            onLoad={() => setLoaded(true)}
            {...rest}
          />
        </picture>
      ) : (
        <img
          src={resolvedSrc}
          alt={alt}
          className={imgClasses}
          style={style}
          onLoad={() => setLoaded(true)}
          {...rest}
        />
      )}
    </div>
  );
};

export default BlurImage;
