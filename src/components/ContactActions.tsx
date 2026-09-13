import { Facebook, Mail, MessageCircle, Phone } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  whatsappMessage?: string;
  emailSubject?: string;
  showFacebook?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold uppercase tracking-wide transition-colors";

export function ContactActions({
  className,
  whatsappMessage,
  emailSubject,
  showFacebook = true,
}: Props) {
  const { contact, telHref, mailtoHref, whatsappHref } = useSiteSettings();

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <a href={telHref} className={cn(base, "bg-primary text-primary-foreground hover:bg-primary/90")}>
        <Phone className="size-4" aria-hidden="true" />
        Call Dealership
      </a>
      <a
        href={whatsappHref(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, "bg-accent text-accent-foreground hover:bg-accent/90")}
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        WhatsApp
      </a>
      <a
        href={mailtoHref(emailSubject)}
        className={cn(base, "border border-border bg-card text-foreground hover:bg-secondary")}
      >
        <Mail className="size-4" aria-hidden="true" />
        Email Us
      </a>
      {showFacebook && (
        <a
          href={contact.facebookGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(base, "border border-border bg-card text-foreground hover:bg-secondary")}
        >
          <Facebook className="size-4" aria-hidden="true" />
          Facebook Group
        </a>
      )}
    </div>
  );
}
