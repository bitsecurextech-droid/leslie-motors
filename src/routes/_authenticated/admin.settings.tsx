import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { siteSettingsQueryKey } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

type Form = {
  phone: string;
  phone_display: string;
  whatsapp: string;
  whatsapp_display: string;
  email: string;
  facebook_group_url: string;
};

const empty: Form = {
  phone: "",
  phone_display: "",
  whatsapp: "",
  whatsapp_display: "",
  email: "",
  facebook_group_url: "",
};

function AdminSettings() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: siteSettingsQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [form, setForm] = useState<Form>(empty);

  useEffect(() => {
    if (data) {
      setForm({
        phone: data.phone,
        phone_display: data.phone_display,
        whatsapp: data.whatsapp,
        whatsapp_display: data.whatsapp_display,
        email: data.email,
        facebook_group_url: data.facebook_group_url,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!/^\+?[0-9]{7,20}$/.test(form.phone.trim())) throw new Error("Enter a valid phone number");
      if (!/^[0-9]{7,20}$/.test(form.whatsapp.trim()))
        throw new Error("WhatsApp number must be digits only, including country code");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) throw new Error("Enter a valid email");
      if (!/^https?:\/\//.test(form.facebook_group_url.trim()))
        throw new Error("Facebook group link must start with https://");
      const { error } = await supabase
        .from("site_settings")
        .update({
          phone: form.phone.trim(),
          phone_display: form.phone_display.trim(),
          whatsapp: form.whatsapp.trim(),
          whatsapp_display: form.whatsapp_display.trim(),
          email: form.email.trim(),
          facebook_group_url: form.facebook_group_url.trim(),
        })
        .eq("id", true);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contact details updated across the website");
      void queryClient.invalidateQueries({ queryKey: siteSettingsQueryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const fields: { key: keyof Form; label: string; hint: string }[] = [
    { key: "phone", label: "Dealership phone (dial format)", hint: "Example +13153672420" },
    { key: "phone_display", label: "Phone shown on site", hint: "Example +1 315-367-2420" },
    { key: "whatsapp", label: "WhatsApp number (digits only)", hint: "Example 13092595685" },
    { key: "whatsapp_display", label: "WhatsApp shown on site", hint: "Example +1 309-259-5685" },
    { key: "email", label: "Dealership email", hint: "Used for enquiries and email links" },
    { key: "facebook_group_url", label: "Facebook group link", hint: "Full https link" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold uppercase tracking-tight">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Update dealership contact details. Changes appear on the public website immediately.
      </p>

      <form
        className="mt-6 grid gap-4 rounded-lg border border-border bg-card p-5 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        {fields.map((f) => (
          <label key={f.key} className="text-sm">
            <span className="mb-2 block font-medium">{f.label}</span>
            <input
              className={inputClass}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              maxLength={200}
              required
            />
            <span className="mt-1 block text-xs text-muted-foreground">{f.hint}</span>
          </label>
        ))}
        <button
          type="submit"
          disabled={save.isPending}
          className="inline-flex w-fit items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-60 sm:col-span-2"
        >
          <Save className="size-4" aria-hidden="true" />
          Save changes
        </button>
      </form>
    </div>
  );
}
