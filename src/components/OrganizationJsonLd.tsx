import { useEffect } from "react";
import { useCMSValue } from "@/hooks/useCMS";
import { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";

const OrganizationJsonLd = () => {
  const linkedin = useCMSValue("social_linkedin", "");
  const twitter = useCMSValue("social_twitter", "");
  const facebook = useCMSValue("social_facebook", "");
  const instagram = useCMSValue("social_instagram", "");
  const youtube = useCMSValue("social_youtube", "");
  const github = useCMSValue("social_github", "");

  useEffect(() => {
    const sameAs = [linkedin, twitter, facebook, instagram, youtube, github].filter(Boolean);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.png`,
      description:
        "Soluciones Cloud y Tecnología para Empresas. Más de 20 años de experiencia en servicios IT profesionales.",
      founder: { "@type": "Person", name: "Jose Isla Perez" },
      areaServed: { "@type": "Country", name: "España" },
      knowsAbout: [
        "Cloud Computing",
        "Hosting",
        "Administración de Sistemas",
        "Desarrollo Web",
        "Seguridad IT",
        "Consultoría Tecnológica",
      ],
      ...(sameAs.length > 0 ? { sameAs } : {}),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-org-jsonld", "true");
    script.textContent = JSON.stringify(jsonLd);

    // Remove any existing org jsonld
    document.querySelectorAll('script[data-org-jsonld]').forEach((el) => el.remove());
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [linkedin, twitter, facebook, instagram, youtube, github]);

  return null;
};

export default OrganizationJsonLd;
