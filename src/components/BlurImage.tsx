import { useState, useRef, useEffect, ImgHTMLAttributes } from "react";

interface BlurImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "onLoad"> {
  /** Tiny base64 or solid-color placeholder shown while loading */
  placeholderColor?: string;
  /** Extra wrapper classes */
  wrapperClassName?: string;
}

/**
 * Image component with blur-up placeholder effect.
 * Uses IntersectionObserver for true lazy loading and
 * a CSS blur transition for a smooth reveal.
 */
const BlurImage = ({
  src,
  alt = "",
  className = "",
  wrapperClassName = "",
  placeholderColor,
  style,
  ...rest
}: BlurImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    // If IntersectionObserver not available, load immediately
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
      { rootMargin: "200px" } // Start loading 200px before viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`overflow-hidden ${wrapperClassName}`}
      style={{
        backgroundColor: placeholderColor || "hsl(var(--muted))",
      }}
    >
      <img
        ref={imgRef}
        src={inView ? src : undefined}
        alt={alt}
        className={`transition-all duration-700 ease-out ${
          loaded ? "blur-0 scale-100 opacity-100" : "blur-md scale-105 opacity-0"
        } ${className}`}
        style={style}
        onLoad={() => setLoaded(true)}
        {...rest}
      />
    </div>
  );
};

export default BlurImage;
