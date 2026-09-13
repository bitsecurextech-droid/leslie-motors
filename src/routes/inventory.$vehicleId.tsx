import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { ContactActions } from "@/components/ContactActions";
import { VideoPreview } from "@/components/VideoPreview";
import { siteConfig } from "@/config/site";
import { useRealtimeInvalidate } from "@/hooks/useRealtime";
import { vehicleBySlugQueryOptions, vehicleImagesQueryOptions } from "@/lib/inventory";
import { formatMiles, formatPrice } from "@/lib/format";

const titleCase = (slug: string) =>
  slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

export const Route = createFileRoute("/inventory/$vehicleId")({
  head: ({ params }) => {
    const label = titleCase(params.vehicleId);
    const title = `${label} - Leslie Motor Co.`;
    const description = `${label} for sale at Leslie Motor Co. Call +1 315-367-2420 or message us on WhatsApp to check availability.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: VehicleDetail,
});

function VehicleDetail() {
  const { vehicleId } = Route.useParams();
  useRealtimeInvalidate(["vehicles", "vehicle_images"], ["vehicle", "vehicle_images"]);

  const { data: v, isLoading } = useQuery(vehicleBySlugQueryOptions(vehicleId));
  const { data: images = [] } = useQuery(vehicleImagesQueryOptions(v?.id));

  if (isLoading) {
    return <p className="mx-auto max-w-6xl px-4 py-20 text-sm text-muted-foreground">Loading…</p>;
  }

  if (!v) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Vehicle not available</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This listing may have sold. Browse what's on the lot right now.
        </p>
        <Link to="/inventory" className="mt-6 inline-block text-sm text-primary hover:underline">
          ← Back to inventory
        </Link>
      </div>
    );
  }

  const specs = [
    ["Mileage", formatMiles(v.mileage)],
    ["Drivetrain", v.drivetrain],
    ["Transmission", v.transmission],
    ["Fuel", v.fuel],
    ["Exterior", v.exterior],
    ["Stock #", v.stock],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  const whatsappMessage = `Hello ${siteConfig.shortName}, I'm interested in the ${v.year} ${v.make} ${v.model}, stock #${v.stock}. Is it still available?`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/inventory" className="text-sm text-muted-foreground hover:text-primary">
        ← Back to inventory
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <img
            src={v.image_url || hero}
            alt={`${v.year} ${v.make} ${v.model}`}
            width={1920}
            height={1080}
            className="w-full rounded-lg border border-border object-cover"
          />
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={`${v.year} ${v.make} ${v.model} photo`}
                  loading="lazy"
                  className="h-24 w-full rounded-md border border-border object-cover"
                />
              ))}
            </div>
          )}
          <VideoPreview url={v.video_url} />
          <h1 className="mt-6 text-3xl font-extrabold uppercase tracking-tight">
            {v.year} {v.make} {v.model}
          </h1>
          {v.trim && <p className="mt-1 text-muted-foreground">{v.trim}</p>}
          <p className="mt-4 text-3xl font-bold text-primary">{formatPrice(Number(v.price))}</p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            {specs.map(([label, value]) => (
              <div key={label} className="rounded-md border border-border bg-card p-4">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {v.description && <p className="mt-8 text-sm text-muted-foreground">{v.description}</p>}

          {v.highlights.length > 0 && (
            <>
              <h2 className="mt-10 text-lg font-bold uppercase tracking-tight">Highlights</h2>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {v.highlights.map((h) => (
                  <li key={h}>• {h}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-bold uppercase tracking-tight">Ask about this vehicle</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reach {siteConfig.shortName} directly - we usually reply the same day.
          </p>
          <ContactActions
            className="mt-6 flex-col [&>a]:w-full"
            whatsappMessage={whatsappMessage}
            emailSubject={`${v.year} ${v.make} ${v.model} (Stock #${v.stock})`}
          />
          <Link
            to="/contact"
            search={{ vehicle: v.slug }}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-secondary"
          >
            Contact Form
          </Link>
        </aside>
      </div>
    </div>
  );
}
