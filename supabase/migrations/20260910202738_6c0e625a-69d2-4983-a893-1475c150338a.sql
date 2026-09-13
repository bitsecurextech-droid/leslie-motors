CREATE TABLE public.site_settings (
  id boolean PRIMARY KEY DEFAULT true,
  phone text NOT NULL,
  phone_display text NOT NULL,
  whatsapp text NOT NULL,
  whatsapp_display text NOT NULL,
  email text NOT NULL,
  facebook_group_url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id)
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are public" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.site_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;

INSERT INTO public.site_settings (id, phone, phone_display, whatsapp, whatsapp_display, email, facebook_group_url)
VALUES (true, '+13153672420', '+1 315-367-2420', '13092595685', '+1 309-259-5685', 'franckauto704@gmail.com', 'https://www.facebook.com/share/g/1E64vLDW5c/?mibextid=wwXIfr');