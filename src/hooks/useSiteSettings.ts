import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/config/site";

export type ContactSettings = {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappDisplay: string;
  email: string;
  facebookGroupUrl: string;
};

const fallback: ContactSettings = {
  phone: siteConfig.contact.phone,
  phoneDisplay: siteConfig.contact.phoneDisplay,
  whatsapp: siteConfig.contact.whatsapp,
  whatsappDisplay: siteConfig.contact.whatsappDisplay,
  email: siteConfig.contact.email,
  facebookGroupUrl: siteConfig.contact.facebookGroupUrl,
};

export const siteSettingsQueryKey = ["site_settings"] as const;

export function useSiteSettings() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: siteSettingsQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    const channel = supabase.channel(
      `site_settings_changes_${Math.random().toString(36).slice(2)}`,
    );
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "site_settings" },
      () => void queryClient.invalidateQueries({ queryKey: siteSettingsQueryKey }),
    );
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const contact: ContactSettings = data
    ? {
        phone: data.phone,
        phoneDisplay: data.phone_display,
        whatsapp: data.whatsapp,
        whatsappDisplay: data.whatsapp_display,
        email: data.email,
        facebookGroupUrl: data.facebook_group_url,
      }
    : fallback;

  return {
    contact,
    telHref: `tel:${contact.phone}`,
    mailtoHref: (subject?: string, body?: string) => {
      const params = new URLSearchParams();
      if (subject) params.set("subject", subject);
      if (body) params.set("body", body);
      const qs = params.toString();
      return `mailto:${contact.email}${qs ? `?${qs}` : ""}`;
    },
    whatsappHref: (message?: string) =>
      `https://wa.me/${contact.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`,
  };
}
