import { useEffect } from 'react';

const SITE_NAME = 'Isla Cloud Solutions';
const DEFAULT_DESCRIPTION = 'Servicios IT profesionales: hosting, cloud, desarrollo web, consultoría y mantenimiento informático. Tu socio tecnológico de confianza.';
const SITE_URL = 'https://www.islacloudsolutions.com';

interface PageMetaOptions {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  jsonLd?: Record<string, unknown>;
}

const usePageMeta = ({ title, description, canonical, ogImage, type = 'website', publishedTime, jsonLd }: PageMetaOptions) => {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = canonical ? `${SITE_URL}${canonical}` : undefined;
    const image = ogImage || `${SITE_URL}/og-image.jpg`;

    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:type', type);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', image);

    if (url) {
      setMeta('property', 'og:url', url);
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    }

    if (type === 'article' && publishedTime) {
      setMeta('property', 'article:published_time', publishedTime);
    }

    // JSON-LD structured data
    let scriptEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }

    return () => {
      document.title = SITE_NAME;
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, [title, description, canonical, ogImage, type, publishedTime, jsonLd]);
};

export default usePageMeta;
export { SITE_URL, SITE_NAME };
