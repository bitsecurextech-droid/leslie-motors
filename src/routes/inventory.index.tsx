import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import hero from "@/assets/hero.jpg";
import { ContactActions } from "@/components/ContactActions";
import { siteConfig } from "@/config/site";
import { useRealtimeInvalidate } from "@/hooks/useRealtime";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { categoriesQueryOptions, publishedVehiclesQueryOptions } from "@/lib/inventory";
import { formatMiles, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventory/")({
  head: () => ({
    meta: [
      { title: "Inventory - Leslie Motor Co." },
      {
        name: "description",
        content:
          "Browse current pre-owned cars, trucks and SUVs available at Leslie Motor Co. Call +1 315-367-2420 or message us on WhatsApp.",
      },
      { property: "og:title", content: "Inventory - Leslie Motor Co." },
      {
        property: "og:description",
        content: "Browse current pre-owned cars, trucks and SUVs available at Leslie Motor Co.",
      },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const { contact } = useSiteSettings();
  useRealtimeInvalidate(["vehicles", "categories", "vehicle_categories"], ["vehicles", "categories"]);

  const { data: vehicles = [], isLoading } = useQuery(publishedVehiclesQueryOptions);
  const { data: categories = [] } = useQuery(categoriesQueryOptions);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      const inCategory =
        !activeCategory || v.vehicle_categories?.some((vc) => vc.category_id === activeCategory);
      const haystack = `${v.year} ${v.make} ${v.model} ${v.trim ?? ""} ${v.stock}`.toLowerCase();
      return inCategory && (!term || haystack.includes(term));
    });
  }, [vehicles, activeCategory, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight">Current Inventory</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        See something you like? Call, WhatsApp or email us and we'll hold it for a test drive.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search make, model or stock number"
          aria-label="Search inventory"
          className="w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
              activeCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={cn(
                "rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                activeCategory === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading vehicles…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          No vehicles match that search. Call {contact.phoneDisplay} and we'll source one for you.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <Link
              key={v.id}
              to="/inventory/$vehicleId"
              params={{ vehicleId: v.slug }}
              className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
            >
              <div className="relative">
                <img
                  src={v.image_url || hero}
                  alt={`${v.year} ${v.make} ${v.model}`}
                  loading="lazy"
                  width={1920}
                  height={1080}
                  className="h-44 w-full object-cover"
                />
                {v.status !== "available" && (
                  <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase text-primary-foreground">
                    {v.status}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-semibold">
                  {v.year} {v.make} {v.model}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[v.trim, formatMiles(v.mileage), v.drivetrain].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-3 text-lg font-bold text-primary">{formatPrice(Number(v.price))}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-14 rounded-lg border border-border bg-card p-8">
        <h2 className="text-xl font-bold uppercase tracking-tight">Looking for something else?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us what you need and we'll source it. Call {contact.phoneDisplay}.
        </p>
        <ContactActions
          className="mt-6"
          whatsappMessage={`Hello ${siteConfig.shortName}, I'm looking for a specific vehicle. Can you help?`}
        />
      </div>
    </div>
  );
}
