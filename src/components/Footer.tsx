import { Link } from "@tanstack/react-router";
import { Facebook, Mail, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { siteConfig } from "@/config/site";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function Footer() {
  const { contact, telHref, mailtoHref, whatsappHref } = useSiteSettings();

  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Logo className="size-16" />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{siteConfig.tagline}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
            Get in touch
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={telHref}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Phone className="size-4" aria-hidden="true" />
                {contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={whatsappHref(`Hello ${siteConfig.shortName}, I have a question.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp {contact.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={mailtoHref()}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Mail className="size-4" aria-hidden="true" />
                {contact.email}
              </a>
            </li>
            <li>
              <a
                href={contact.facebookGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Facebook className="size-4" aria-hidden="true" />
                Facebook Group
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link to="/inventory" className="text-muted-foreground hover:text-primary">
                Inventory
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-muted-foreground hover:text-primary">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/auth" className="text-muted-foreground hover:text-primary">
                Staff Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
