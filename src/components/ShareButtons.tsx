import { Linkedin, MessageCircle } from "lucide-react";
import { SITE_URL } from "@/hooks/usePageMeta";

const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
