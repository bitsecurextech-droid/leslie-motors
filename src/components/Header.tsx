import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { siteConfig } from "@/config/site";
import { useSession, useIsAdmin } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const nav = [
  { to: "/", label: "Home" },
  { to: "/inventory", label: "Inventory" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { contact, telHref } = useSiteSettings();
  const { user } = useSession();
  const { data: isAdmin } = useIsAdmin(user?.id);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <Logo />
          <span className="hidden text-sm font-extrabold uppercase tracking-[0.2em] sm:inline">
            {siteConfig.shortName}
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-primary hover:underline"
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Dashboard
            </Link>
          )}
        </nav>
        <a
          href={telHref}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Phone className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{contact.phoneDisplay}</span>
          <span className="sm:hidden">Call</span>
        </a>
      </div>
      <nav className="flex items-center justify-center gap-5 border-t border-border/60 px-4 py-2 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: item.to === "/" }}
          >
            {item.label}
          </Link>
        ))}
        {isAdmin && (
          <Link to="/admin" className="text-xs font-medium uppercase tracking-wide text-primary">
            Dashboard
          </Link>
        )}
      </nav>
    </header>
  );
}
