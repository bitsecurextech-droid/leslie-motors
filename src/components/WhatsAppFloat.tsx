import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { siteConfig } from "@/config/site";

/** Floating WhatsApp chat button, visible on every page. */
export function WhatsAppFloat() {
  const { whatsappHref } = useSiteSettings();

  return (
    <a
      href={whatsappHref(`Hello ${siteConfig.shortName}, I'd like to chat about a vehicle.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
