import { 
  Server, Shield, Cloud, Monitor, Globe, Smartphone, 
  Lock, Wrench, Database, Headphones, Clock, Award 
} from "lucide-react";

export interface ServiceData {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  icon: typeof Server;
  features: string[];
}

export const services: ServiceData[] = [
  {
    slug: "administracion-it",
    title: "Administración Avanzada de Sistemas IT",
    shortTitle: "Administración IT",
    description: "Gestión proactiva 24x7 de servidores, CPDs, web servers, mail servers, VPN y backup cloud avanzado.",
    longDescription: "Nuestro equipo de administradores de sistemas gestiona tu infraestructura IT de forma proactiva, garantizando máxima disponibilidad y rendimiento. Monitorizamos 24x7, aplicamos parches de seguridad, gestionamos backups y optimizamos tus servidores para que tú te centres en tu negocio.",
    icon: Server,
    features: ["Monitorización 24x7", "SLA garantizado", "Gestión de CPDs", "Backup cloud avanzado", "Administración de servidores web/email", "Cumplimiento RGPD"],
  },
  {
    slug: "hosting",
    title: "Hosting Profesional",
    shortTitle: "Hosting",
    description: "Hosting VPS y Cloud Server 100% gestionado con SLA garantizado. Servidores alojados en España.",
    longDescription: "Ofrecemos hosting profesional tanto en modalidad VPS como Cloud Server, alojado en datacenters de primer nivel en España (INTERXION). Desde páginas corporativas hasta complejos sistemas de ecommerce, nuestro equipo gestiona toda la infraestructura para garantizar máximo rendimiento y seguridad.",
    icon: Database,
    features: ["100% gestionado", "SLA garantizado", "Servidores en España", "Alta disponibilidad", "Escalabilidad automática", "Soporte técnico 24x7"],
  },
  {
    slug: "cloud-servers",
    title: "Cloud Servers",
    shortTitle: "Cloud Servers",
    description: "Infraestructura cloud escalable y segura para tu empresa. Servidores virtuales de alto rendimiento.",
    longDescription: "Despliega tu infraestructura en la nube con nuestros Cloud Servers de alto rendimiento. Escalabilidad instantánea, redundancia geográfica y gestión completa por nuestro equipo de expertos. La solución ideal para empresas que necesitan flexibilidad y fiabilidad.",
    icon: Cloud,
    features: ["Escalabilidad instantánea", "Redundancia geográfica", "Alto rendimiento", "Gestión completa", "Pago por uso", "Migración asistida"],
  },
  {
    slug: "vpn-seguras",
    title: "VPN Seguras",
    shortTitle: "VPN Seguras",
    description: "Conexiones VPN securizadas con SSL o IPSec para acceso remoto seguro a tu infraestructura.",
    longDescription: "Implementamos soluciones VPN empresariales con los más altos estándares de seguridad. Conexiones SSL e IPSec para teletrabajo seguro, interconexión de sedes y acceso remoto a recursos corporativos con cifrado de última generación.",
    icon: Lock,
    features: ["VPN SSL/IPSec", "Cifrado de última generación", "Teletrabajo seguro", "Interconexión de sedes", "Gestión centralizada", "Autenticación multifactor"],
  },
  {
    slug: "desarrollo-web",
    title: "Desarrollo Web y Ecommerce",
    shortTitle: "Desarrollo Web",
    description: "Diseño y desarrollo de sitios web corporativos, tiendas online y soluciones web a medida.",
    longDescription: "Desarrollamos proyectos web completos, desde landing pages corporativas hasta complejas plataformas de comercio electrónico. Te acompañamos en todas las etapas de la creación de tu presencia en Internet con las últimas tecnologías y mejores prácticas de UX/UI.",
    icon: Globe,
    features: ["Diseño responsive", "Ecommerce completo", "SEO optimizado", "CMS personalizado", "Integración con APIs", "Mantenimiento continuo"],
  },
  {
    slug: "apps-moviles",
    title: "Desarrollo de Apps Móviles",
    shortTitle: "Apps Móviles",
    description: "Desarrollo nativo y diseño UX/UI de aplicaciones móviles a medida para empresas.",
    longDescription: "Diseñamos y desarrollamos aplicaciones móviles personalizadas desde cero o renovamos tu app actual. Desarrollo nativo e híbrido con las mejores prácticas de diseño UX/UI para iOS y Android, integradas con tus sistemas empresariales.",
    icon: Smartphone,
    features: ["Desarrollo nativo iOS/Android", "Diseño UX/UI", "Apps híbridas", "Integración empresarial", "Publicación en stores", "Mantenimiento y actualizaciones"],
  },
  {
    slug: "seguridad",
    title: "Consultoría IT y Seguridad",
    shortTitle: "Seguridad IT",
    description: "Asesoramiento informático, auditorías de seguridad y adecuación al RGPD para empresas.",
    longDescription: "Lideramos el proceso de transformación digital de tu empresa con servicios de consultoría IT y seguridad informática. Realizamos auditorías, implementamos políticas de seguridad y te ayudamos a cumplir con la normativa RGPD para proteger tu negocio.",
    icon: Shield,
    features: ["Auditorías de seguridad", "Adecuación RGPD", "Políticas de seguridad", "Protección anti-malware", "Plan de continuidad", "Formación en ciberseguridad"],
  },
  {
    slug: "mantenimiento",
    title: "Mantenimiento Informático para Empresas",
    shortTitle: "Mantenimiento IT",
    description: "Servicio de mantenimiento informático con revisiones presenciales y tiempos de respuesta inmediatos.",
    longDescription: "Ponemos a disposición de nuestros clientes un servicio de mantenimiento de calidad, adaptado a las necesidades de cada empresa. Revisiones presenciales mensuales, soporte remoto inmediato y los mejores técnicos profesionales para garantizar la continuidad de tu negocio.",
    icon: Wrench,
    features: ["Revisiones presenciales", "Soporte remoto 24x7", "Respuesta inmediata", "Mantenimiento preventivo", "Inventario de equipos", "Informes mensuales"],
  },
  {
    slug: "soluciones-cloud",
    title: "Soluciones Cloud Empresariales",
    shortTitle: "Soluciones Cloud",
    description: "Archivos en la nube, intranets privadas y soluciones de teletrabajo para empresas y profesionales.",
    longDescription: "Proporcionamos soluciones cloud integrales para el trabajo y teletrabajo empresarial. Intranets privadas, almacenamiento en la nube, sincronización de archivos y herramientas de colaboración, todo integrado sin configuraciones complejas.",
    icon: Monitor,
    features: ["Intranet privada", "Archivos en la nube", "Teletrabajo integrado", "Sincronización automática", "Sin configuraciones", "Acceso desde cualquier dispositivo"],
  },
];

export const whyUsReasons = [
  { icon: Clock, title: "+20 años de experiencia", description: "Más de dos décadas resolviendo retos tecnológicos empresariales." },
  { icon: Headphones, title: "Soporte 24x7", description: "Equipo técnico disponible las 24 horas, los 7 días de la semana." },
  { icon: Shield, title: "Seguridad garantizada", description: "Protocolos de seguridad avanzados y cumplimiento RGPD." },
  { icon: Award, title: "SLA garantizado", description: "Acuerdos de nivel de servicio con tiempos de respuesta comprometidos." },
];

export const clientLogos = [
  "Fundación Amigos Museo del Prado",
  "Fundación Museo Reina Sofía",
  "American Friends of Prado Museum",
  "Fran Silvestre Arquitectos",
  "GSTI Research Center",
  "Meatzaldeko Behargintza",
  "Merkasano",
  "Hierro Pérez Abogados",
];
