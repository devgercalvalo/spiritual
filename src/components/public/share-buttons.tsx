"use client";

import { useState } from "react";
import { Link2, MessageCircle } from "lucide-react";

// lucide-react ya no incluye logotipos de marca; se dibujan como SVG inline.
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5H16l.5-3H13.5V8.25c0-.87.24-1.46 1.49-1.46H16.5V4.14C16.2 4.1 15.2 4 14 4c-2.4 0-4 1.46-4 4.14V10.5H7.5v3H10V21h3.5Z" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 3H21l-6.6 7.55L22 21h-6.4l-5-6.53L4.7 21H2.6l7.06-8.08L2 3h6.55l4.53 5.98L18.9 3Zm-1.12 16.17h1.17L7.3 4.76H6.05l11.73 14.41Z" />
    </svg>
  );
}

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "Facebook",
      icon: FacebookIcon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "X",
      icon: XIcon,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-500">Compartir:</span>
      {links.map(({ label, icon: Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Compartir en ${label}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:border-purple-700 hover:text-purple-700 dark:border-neutral-700 dark:text-neutral-300"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        aria-label="Copiar enlace"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:border-purple-700 hover:text-purple-700 dark:border-neutral-700 dark:text-neutral-300"
      >
        <Link2 className="h-4 w-4" />
      </button>
      {copied && <span className="text-xs text-emerald-600">¡Enlace copiado!</span>}
    </div>
  );
}
