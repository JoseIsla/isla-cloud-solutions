import { Linkedin, MessageCircle, Mail } from "lucide-react";
import { SITE_URL } from "@/hooks/usePageMeta";

const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.092.044 1.545.103v3.203h-1.262c-1.565 0-2.05.59-2.05 2.13v2.122h3.164l-.544 3.667h-2.62v8.069C19.23 23.142 23 18.022 23 12.001 23 5.37 17.627 0 11 0S-1 5.37-1 12.001c0 5.11 2.638 9.6 6.631 12.19l.47-.5z" />
  </svg>
);

const TelegramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

interface ShareButtonsProps {
  path: string;
  title: string;
}

const ShareButtons = ({ path, title }: ShareButtonsProps) => {
  const url = encodeURIComponent(`${SITE_URL}${path}`);
  const text = encodeURIComponent(title);

  const links = [
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      label: "Compartir en Facebook",
      iconCustom: FacebookIcon,
    },
    {
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      label: "Compartir en LinkedIn",
      icon: Linkedin,
    },
    {
      href: `https://x.com/intent/tweet?url=${url}&text=${text}`,
      label: "Compartir en X",
      iconCustom: XIcon,
    },
    {
      href: `https://wa.me/?text=${text}%20${url}`,
      label: "Compartir en WhatsApp",
      icon: MessageCircle,
    },
    {
      href: `https://t.me/share/url?url=${url}&text=${text}`,
      label: "Compartir en Telegram",
      iconCustom: TelegramIcon,
    },
    {
      href: `mailto:?subject=${text}&body=${text}%20${url}`,
      label: "Compartir por Email",
      icon: Mail,
    },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground font-medium">Compartir:</span>
      {links.map(({ href, label, icon: Icon, iconCustom: CustomIcon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
        >
          {CustomIcon ? <CustomIcon size={16} /> : Icon ? <Icon size={16} /> : null}
        </a>
      ))}
    </div>
  );
};

export default ShareButtons;
