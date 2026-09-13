import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, CheckCircle2, Inbox, Tags } from "lucide-react";
import { useRealtimeInvalidate } from "@/hooks/useRealtime";
import {
  allVehiclesQueryOptions,
  categoriesQueryOptions,
  messagesQueryOptions,
} from "@/lib/inventory";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  useRealtimeInvalidate(
    ["vehicles", "categories", "contact_messages"],
    ["vehicles", "categories", "contact_messages"],
  );
  const { data: vehicles = [] } = useQuery(allVehiclesQueryOptions);
  const { data: categories = [] } = useQuery(categoriesQueryOptions);
  const { data: messages = [] } = useQuery(messagesQueryOptions);

  const available = vehicles.filter((v) => v.status === "available").length;
  const reserved = vehicles.filter((v) => v.status === "reserved").length;
  const sold = vehicles.filter((v) => v.status === "sold").length;
  const unread = messages.filter((m) => !m.is_read).length;
  const stockValue = vehicles
    .filter((v) => v.status !== "sold")
    .reduce((sum, v) => sum + Number(v.price), 0);

  const stats = [
    { label: "Total vehicles", value: vehicles.length, icon: Car },
    { label: "Available", value: available, icon: CheckCircle2 },
    { label: "Reserved", value: reserved, icon: Car },
    { label: "Sold", value: sold, icon: CheckCircle2 },
    { label: "Categories", value: categories.length, icon: Tags },
    { label: "New enquiries", value: unread, icon: Inbox },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold uppercase tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Live overview of inventory and customer enquiries.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-5">
            <s.icon className="size-5 text-primary" aria-hidden="true" />
            <p className="mt-3 text-3xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Stock value on lot</p>
        <p className="mt-2 text-2xl font-bold text-primary">{formatPrice(stockValue)}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Recent vehicles</h2>
            <Link to="/admin/vehicles" className="text-xs text-primary hover:underline">
              Manage
            </Link>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {vehicles.slice(0, 5).map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3">
                <span className="truncate">
                  {v.year} {v.make} {v.model}
                </span>
                <span className="shrink-0 text-muted-foreground">{v.status}</span>
              </li>
            ))}
            {vehicles.length === 0 && <li className="text-muted-foreground">No vehicles yet.</li>}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Latest enquiries</h2>
            <Link to="/admin/messages" className="text-xs text-primary hover:underline">
              Open inbox
            </Link>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {messages.slice(0, 5).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3">
                <span className="truncate">{m.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  {new Date(m.created_at).toLocaleDateString("en-US")}
                </span>
              </li>
            ))}
            {messages.length === 0 && <li className="text-muted-foreground">No enquiries yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
