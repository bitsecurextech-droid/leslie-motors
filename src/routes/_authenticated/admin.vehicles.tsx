import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeInvalidate } from "@/hooks/useRealtime";
import {
  allVehiclesQueryOptions,
  categoriesQueryOptions,
  type VehicleWithCategories,
} from "@/lib/inventory";
import { formatMiles, formatPrice, slugify } from "@/lib/format";
import { uploadVehiclePhoto } from "@/lib/media";
import { VideoPreview } from "@/components/VideoPreview";

export const Route = createFileRoute("/_authenticated/admin/vehicles")({
  component: AdminVehicles,
});

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

const statuses = ["available", "reserved", "sold", "inspection", "maintenance", "archived"] as const;

type FormState = {
  id: string | null;
  year: string;
  make: string;
  model: string;
  trim: string;
  stock: string;
  vin: string;
  price: string;
  mileage: string;
  transmission: string;
  fuel: string;
  drivetrain: string;
  exterior: string;
  status: string;
  published: boolean;
  featured: boolean;
  image_url: string;
  video_url: string;
  gallery: string[];
  description: string;
  highlights: string;
  categoryIds: string[];
};

const emptyForm: FormState = {
  id: null,
  year: String(new Date().getFullYear()),
  make: "",
  model: "",
  trim: "",
  stock: "",
  vin: "",
  price: "0",
  mileage: "0",
  transmission: "",
  fuel: "",
  drivetrain: "",
  exterior: "",
  status: "available",
  published: true,
  featured: false,
  image_url: "",
  video_url: "",
  gallery: [],
  description: "",
  highlights: "",
  categoryIds: [],
};

function toForm(v: VehicleWithCategories, gallery: string[]): FormState {
  return {
    id: v.id,
    year: String(v.year),
    make: v.make,
    model: v.model,
    trim: v.trim ?? "",
    stock: v.stock,
    vin: v.vin ?? "",
    price: String(v.price),
    mileage: String(v.mileage),
    transmission: v.transmission ?? "",
    fuel: v.fuel ?? "",
    drivetrain: v.drivetrain ?? "",
    exterior: v.exterior ?? "",
    status: v.status,
    published: v.published,
    featured: v.featured,
    image_url: v.image_url ?? "",
    video_url: v.video_url ?? "",
    gallery,
    description: v.description ?? "",
    highlights: (v.highlights ?? []).join("\n"),
    categoryIds: v.vehicle_categories.map((c) => c.category_id),
  };
}

function AdminVehicles() {
  useRealtimeInvalidate(["vehicles", "vehicle_categories"], ["vehicles"]);
  const queryClient = useQueryClient();
  const { data: vehicles = [] } = useQuery(allVehiclesQueryOptions);
  const { data: categories = [] } = useQuery(categoriesQueryOptions);
  const [form, setForm] = useState<FormState | null>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: allImages = [] } = useQuery({
    queryKey: ["vehicle_images", "all"] as const,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_images")
        .select("vehicle_id, url, sort_order")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const galleryFor = (vehicleId: string) =>
    allImages.filter((i) => i.vehicle_id === vehicleId).map((i) => i.url);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    void queryClient.invalidateQueries({ queryKey: ["vehicle_images"] });
  };

  async function handleUpload(files: FileList | null, target: "main" | "gallery") {
    if (!files || files.length === 0 || !form) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, 12)) {
        urls.push(await uploadVehiclePhoto(file));
      }
      setForm((prev) =>
        prev
          ? target === "main"
            ? { ...prev, image_url: urls[0]! }
            : { ...prev, gallery: [...prev.gallery, ...urls].slice(0, 20) }
          : prev,
      );
      toast.success(urls.length > 1 ? `${urls.length} photos uploaded` : "Photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      const make = f.make.trim();
      const model = f.model.trim();
      if (!make || !model) throw new Error("Make and model are required");
      const year = Number(f.year);
      if (!Number.isFinite(year) || year < 1900 || year > 2100) throw new Error("Enter a valid year");
      const stock = f.stock.trim() || `LM${Date.now().toString().slice(-6)}`;
      const payload = {
        year,
        make: make.slice(0, 60),
        model: model.slice(0, 60),
        trim: f.trim.trim().slice(0, 60) || null,
        stock: stock.slice(0, 40),
        vin: f.vin.trim().slice(0, 40) || null,
        price: Math.max(0, Number(f.price) || 0),
        mileage: Math.max(0, Number(f.mileage) || 0),
        transmission: f.transmission.trim().slice(0, 40) || null,
        fuel: f.fuel.trim().slice(0, 40) || null,
        drivetrain: f.drivetrain.trim().slice(0, 40) || null,
        exterior: f.exterior.trim().slice(0, 40) || null,
        status: f.status,
        published: f.published,
        featured: f.featured,
        image_url: f.image_url.trim().slice(0, 1000) || null,
        video_url: f.video_url.trim().slice(0, 1000) || null,
        description: f.description.trim().slice(0, 4000) || null,
        highlights: f.highlights
          .split("\n")
          .map((h) => h.trim())
          .filter(Boolean)
          .slice(0, 20),
        slug: slugify(`${year} ${make} ${model} ${stock}`),
      };

      let vehicleId = f.id;
      if (vehicleId) {
        const { error } = await supabase.from("vehicles").update(payload).eq("id", vehicleId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("vehicles").insert(payload).select("id").single();
        if (error) throw error;
        vehicleId = data.id;
      }

      const { error: delErr } = await supabase
        .from("vehicle_categories")
        .delete()
        .eq("vehicle_id", vehicleId);
      if (delErr) throw delErr;
      if (f.categoryIds.length > 0) {
        const { error: insErr } = await supabase
          .from("vehicle_categories")
          .insert(f.categoryIds.map((category_id) => ({ vehicle_id: vehicleId!, category_id })));
        if (insErr) throw insErr;
      }

      const { error: imgDelErr } = await supabase
        .from("vehicle_images")
        .delete()
        .eq("vehicle_id", vehicleId);
      if (imgDelErr) throw imgDelErr;
      if (f.gallery.length > 0) {
        const { error: imgInsErr } = await supabase.from("vehicle_images").insert(
          f.gallery.map((url, i) => ({ vehicle_id: vehicleId!, url, sort_order: i })),
        );
        if (imgInsErr) throw imgInsErr;
      }
    },
    onSuccess: () => {
      toast.success("Vehicle saved");
      setForm(null);
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vehicle deleted");
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const q = search.trim().toLowerCase();
  const filtered = q
    ? vehicles.filter((v) =>
        `${v.year} ${v.make} ${v.model} ${v.trim ?? ""} ${v.stock}`.toLowerCase().includes(q),
      )
    : vehicles;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight">Vehicles</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add, edit, categorize and retire stock. The public site updates instantly.
          </p>
        </div>
        <button
          onClick={() => setForm({ ...emptyForm })}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add vehicle
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search stock"
        className={`${inputClass} mt-6 max-w-sm`}
      />

      {form && (
        <form
          className="mt-6 grid gap-4 rounded-lg border border-primary bg-card p-5 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
        >
          <div className="flex items-center justify-between sm:col-span-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              {form.id ? "Edit vehicle" : "New vehicle"}
            </h2>
            <button type="button" onClick={() => setForm(null)} aria-label="Close form">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {(
            [
              ["year", "Year"],
              ["make", "Make"],
              ["model", "Model"],
              ["trim", "Trim"],
              ["stock", "Stock reference"],
              ["vin", "VIN / chassis"],
              ["price", "Price"],
              ["mileage", "Mileage"],
              ["transmission", "Transmission"],
              ["fuel", "Fuel type"],
              ["drivetrain", "Drive type"],
              ["exterior", "Exterior colour"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="text-sm">
              <span className="mb-2 block font-medium">{label}</span>
              <input
                className={inputClass}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                maxLength={500}
              />
            </label>
          ))}

          <div className="text-sm sm:col-span-3">
            <span className="mb-2 block font-medium">Main photo</span>
            <div className="flex flex-wrap items-start gap-4">
              {form.image_url ? (
                <img
                  src={form.image_url}
                  alt="Main vehicle photo"
                  className="h-28 w-40 rounded-md border border-border object-cover"
                />
              ) : (
                <div className="flex h-28 w-40 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
                  No photo yet
                </div>
              )}
              <div className="grid gap-2">
                <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-secondary">
                  <Upload className="size-4" aria-hidden="true" />
                  {uploading ? "Uploading" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      void handleUpload(e.target.files, "main");
                      e.target.value = "";
                    }}
                  />
                </label>
                <input
                  className={inputClass}
                  placeholder="or paste a photo link"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  maxLength={1000}
                />
              </div>
            </div>
          </div>

          <div className="text-sm sm:col-span-3">
            <span className="mb-2 block font-medium">Extra photos</span>
            <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-secondary">
              <ImagePlus className="size-4" aria-hidden="true" />
              {uploading ? "Uploading" : "Add photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  void handleUpload(e.target.files, "gallery");
                  e.target.value = "";
                }}
              />
            </label>
            {form.gallery.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {form.gallery.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative">
                    <img
                      src={url}
                      alt={`Vehicle photo ${i + 1}`}
                      className="h-20 w-full rounded-md border border-border object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`Remove photo ${i + 1}`}
                      onClick={() =>
                        setForm({ ...form, gallery: form.gallery.filter((_, j) => j !== i) })
                      }
                      className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-muted-foreground hover:text-primary"
                    >
                      <X className="size-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-sm sm:col-span-3">
            <span className="mb-2 block font-medium">Video link (YouTube, Vimeo or MP4)</span>
            <input
              className={inputClass}
              value={form.video_url}
              placeholder="https://youtu.be/..."
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              maxLength={1000}
            />
            <VideoPreview url={form.video_url} />
          </div>


          <label className="text-sm">
            <span className="mb-2 block font-medium">Status</span>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm sm:col-span-3">
            <span className="mb-2 block font-medium">Description</span>
            <textarea
              rows={3}
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={4000}
            />
          </label>

          <label className="text-sm sm:col-span-3">
            <span className="mb-2 block font-medium">Key features, one per line</span>
            <textarea
              rows={3}
              className={inputClass}
              value={form.highlights}
              onChange={(e) => setForm({ ...form, highlights: e.target.value })}
            />
          </label>

          <fieldset className="text-sm sm:col-span-3">
            <legend className="mb-2 font-medium">Categories</legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const on = form.categoryIds.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() =>
                      setForm({
                        ...form,
                        categoryIds: on
                          ? form.categoryIds.filter((id) => id !== c.id)
                          : [...form.categoryIds, c.id],
                      })
                    }
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
              {categories.length === 0 && (
                <p className="text-xs text-muted-foreground">Add categories first.</p>
              )}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-6 text-sm sm:col-span-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Show on public website
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Featured vehicle
            </label>
          </div>

          <button
            type="submit"
            disabled={save.isPending}
            className="w-fit rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-60 sm:col-span-3"
          >
            Save vehicle
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Mileage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Public</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-3 font-medium">
                  {v.year} {v.make} {v.model}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{v.stock}</td>
                <td className="px-4 py-3">{formatPrice(Number(v.price))}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatMiles(v.mileage)}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{v.status}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.published ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setForm(toForm(v, galleryFor(v.id)))}
                      aria-label={`Edit ${v.make} ${v.model}`}
                      className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => remove.mutate(v.id)}
                      aria-label={`Delete ${v.make} ${v.model}`}
                      className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-primary"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-muted-foreground">
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
