import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Tag, Wrench } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { ContactActions } from "@/components/ContactActions";
import { siteConfig } from "@/config/site";
import { useRealtimeInvalidate } from "@/hooks/useRealtime";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { publishedVehiclesQueryOptions } from "@/lib/inventory";
import { formatMiles, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leslie Motor Co. - Quality Pre-Owned Cars & Trucks" },
      {
        name: "description",
        content:
          "Leslie Motor Co. offers hand-picked pre-owned cars, trucks and SUVs. Call +1 315-367-2420 or message us on WhatsApp today.",
      },
      { property: "og:title", content: "Leslie Motor Co. - Quality Pre-Owned Cars & Trucks" },
      {
        property: "og:description",
        content: "Hand-picked pre-owned cars, trucks and SUVs. Call, WhatsApp or email us today.",
      },
    ],
  }),
  component: Index,
});

const perks = [
  {
    icon: ShieldCheck,
    title: "Inspected & Verified",
    text: "Every vehicle passes a multi-point inspection before it hits the lot.",
  },
  {
    icon: Tag,
    title: "Straight Pricing",
    text: "Clear, upfront numbers - no surprise fees at the desk.",
  },
  { icon: Wrench, title: "After-Sale Support", text: "We stay reachable long after you drive away." },
];

function Index() {
  const { contact } = useSiteSettings();
  useRealtimeInvalidate(["vehicles"], ["vehicles"]);
  const { data: vehicles = [] } = useQuery(publishedVehiclesQueryOptions);

  const featured = [...vehicles].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0,8);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={hero}
          alt="Vehicle in the Leslie Motor Co. showroom"
          width={1920}
          height={1080}
          className="absolute inset-0 size-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            {siteConfig.shortName}
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold uppercase leading-tight tracking-tight sm:text-6xl">
            Drive home something you're proud of
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{siteConfig.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inventory"
              className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse Inventory
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-secondary"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {perks.map((p) => (
            <div key={p.title} className="rounded-lg border border-border bg-card p-6">
              <p.icon className="size-6 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Featured Vehicles</h2>
          <Link to="/inventory" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            New listings are on the way - call us for what's available today.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v) => (
              <Link
                key={v.id}
                to="/inventory/$vehicleId"
                params={{ vehicleId: v.slug }}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
              >
                <img
                  src={v.image_url || hero}
                  alt={`${v.year} ${v.make} ${v.model}`}
                  loading="lazy"
                  width={1920}
                  height={1080}
                  className="h-44 w-full object-cover"
                />
                <div className="p-5">
                  <h3 className="font-semibold">
                    {v.year} {v.make} {v.model}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {v.trim} · {formatMiles(v.mileage)}
                  </p>
                  <p className="mt-3 text-lg font-bold text-primary">{formatPrice(Number(v.price))}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border/60 bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Get In Touch</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Questions about a vehicle, financing, or a trade-in? Reach us the way you prefer.
          </p>
          <dl className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="inline font-semibold text-foreground">Phone: </dt>
              <dd className="inline">{contact.phoneDisplay}</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-foreground">WhatsApp: </dt>
              <dd className="inline">{contact.whatsappDisplay}</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-foreground">Email: </dt>
              <dd className="inline">{contact.email}</dd>
            </div>
          </dl>
          <ContactActions
            className="mt-8"
            whatsappMessage={`Hello ${siteConfig.shortName}, I'd like more information.`}
          />
        </div>
      </section>
    </>
  );
}
