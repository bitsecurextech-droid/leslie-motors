import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeInvalidate } from "@/hooks/useRealtime";
import { categoriesQueryOptions } from "@/lib/inventory";
import { slugify } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategories,
});

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function AdminCategories() {
  useRealtimeInvalidate(["categories"], ["categories"]);
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery(categoriesQueryOptions);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const create = useMutation({
    mutationFn: async () => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Category name is required");
      const { error } = await supabase.from("categories").insert({
        name: trimmed.slice(0, 60),
        slug: slugify(trimmed).slice(0, 60),
        description: description.trim().slice(0, 200) || null,
        sort_order: categories.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setName("");
      setDescription("");
      toast.success("Category added");
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category removed");
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold uppercase tracking-tight">Categories</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Categories power the filter tabs customers use on the inventory page.
      </p>

      <form
        className="mt-6 grid gap-3 rounded-lg border border-border bg-card p-5 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <label className="text-sm">
          <span className="mb-2 block font-medium">Name</span>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
        </label>
        <label className="text-sm">
          <span className="mb-2 block font-medium">Description</span>
          <input
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
          />
        </label>
        <button
          type="submit"
          disabled={create.isPending}
          className="mt-auto inline-flex h-[38px] items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add
        </button>
      </form>

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">{c.description ?? c.slug}</p>
            </div>
            <button
              onClick={() => remove.mutate(c.id)}
              aria-label={`Delete ${c.name}`}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="px-5 py-6 text-sm text-muted-foreground">No categories yet.</li>
        )}
      </ul>
    </div>
  );
}
