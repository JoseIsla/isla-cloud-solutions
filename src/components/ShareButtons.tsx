import { Linkedin, Twitter, MessageCircle } from "lucide-react";
import { SITE_URL } from "@/hooks/usePageMeta";

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
      href: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      label: "Compartir en Twitter",
      icon: Twitter,
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
      {links.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
        >
          <Icon size={16} />
        </a>
      ))}
    </div>
  );
};

export default ShareButtons;
