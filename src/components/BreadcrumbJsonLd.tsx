import { useEffect } from 'react';
import { SITE_URL } from '@/hooks/usePageMeta';

interface BreadcrumbItem {
  name: string;
  path: string;
}

const BreadcrumbJsonLd = ({ items }: { items: BreadcrumbItem[] }) => {
  useEffect(() => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: `${SITE_URL}${item.path}`,
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb', 'true');
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [items]);

  return null;
};

export default BreadcrumbJsonLd;
