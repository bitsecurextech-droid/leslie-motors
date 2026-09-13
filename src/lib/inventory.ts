import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Vehicle = Tables<"vehicles">;
export type Category = Tables<"categories">;
export type VehicleImage = Tables<"vehicle_images">;
export type ContactMessage = Tables<"contact_messages">;

export type VehicleWithCategories = Vehicle & {
  vehicle_categories: { category_id: string }[];
};

export const categoriesQueryOptions = {
  queryKey: ["categories"] as const,
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};

export const publishedVehiclesQueryOptions = {
  queryKey: ["vehicles", "published"] as const,
  queryFn: async (): Promise<VehicleWithCategories[]> => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*, vehicle_categories(category_id)")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as VehicleWithCategories[];
  },
};

export const allVehiclesQueryOptions = {
  queryKey: ["vehicles", "all"] as const,
  queryFn: async (): Promise<VehicleWithCategories[]> => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*, vehicle_categories(category_id)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as VehicleWithCategories[];
  },
};

export const messagesQueryOptions = {
  queryKey: ["contact_messages"] as const,
  queryFn: async (): Promise<ContactMessage[]> => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const vehicleBySlugQueryOptions = (slug: string) => ({
  queryKey: ["vehicle", slug] as const,
  queryFn: async (): Promise<VehicleWithCategories | null> => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*, vehicle_categories(category_id)")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as VehicleWithCategories | null;
  },
});

export const vehicleImagesQueryOptions = (vehicleId: string | undefined) => ({
  queryKey: ["vehicle_images", vehicleId] as const,
  enabled: Boolean(vehicleId),
  queryFn: async (): Promise<VehicleImage[]> => {
    const { data, error } = await supabase
      .from("vehicle_images")
      .select("*")
      .eq("vehicle_id", vehicleId!)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});
