CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile" ON public.profiles
  FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  stock text NOT NULL,
  year int NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  trim text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  mileage int NOT NULL DEFAULT 0,
  transmission text,
  drivetrain text,
  fuel text,
  exterior text,
  vin text,
  description text,
  highlights text[] NOT NULL DEFAULT '{}',
  image_url text,
  status text NOT NULL DEFAULT 'available',
  published boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicles_status_check CHECK (status IN ('available','sold','pending','reserved'))
);
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published vehicles are public" ON public.vehicles
  FOR SELECT USING (published = true);
CREATE POLICY "Admins read all vehicles" ON public.vehicles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage vehicles" ON public.vehicles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX vehicles_status_idx ON public.vehicles (status);

CREATE TABLE public.vehicle_categories (
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (vehicle_id, category_id)
);
GRANT SELECT ON public.vehicle_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_categories TO authenticated;
GRANT ALL ON public.vehicle_categories TO service_role;
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicle categories are public" ON public.vehicle_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage vehicle categories" ON public.vehicle_categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.vehicle_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicle_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_images TO authenticated;
GRANT ALL ON public.vehicle_images TO service_role;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicle images are public" ON public.vehicle_images FOR SELECT USING (true);
CREATE POLICY "Admins manage vehicle images" ON public.vehicle_images
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  message text NOT NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'contact_form',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage messages" ON public.contact_messages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.vehicles REPLICA IDENTITY FULL;
ALTER TABLE public.categories REPLICA IDENTITY FULL;
ALTER TABLE public.contact_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;

INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('SUV', 'suv', 1),
  ('Truck', 'truck', 2),
  ('Sedan', 'sedan', 3),
  ('Luxury', 'luxury', 4),
  ('Budget', 'budget', 5);

INSERT INTO public.vehicles (slug, stock, year, make, model, trim, price, mileage, transmission, drivetrain, fuel, exterior, description, highlights, status, featured) VALUES
  ('2024-bmw-x5', 'LM1024', 2024, 'BMW', 'X5', 'xDrive40i', 58900, 12400, '8-Speed Automatic', 'All-Wheel Drive', 'Gasoline', 'Carbon Black', 'Low mileage luxury SUV with a clean history report.', ARRAY['Panoramic roof','Heated seats','Harman Kardon audio','Clean history'], 'available', true),
  ('2022-ford-f150', 'LM0942', 2022, 'Ford', 'F-150', 'Lariat SuperCrew', 44250, 31800, '10-Speed Automatic', '4x4', 'Gasoline', 'Agate Black', 'One-owner Lariat with tow package.', ARRAY['Tow package','360 camera','Leather interior','One owner'], 'available', true),
  ('2023-toyota-camry', 'LM0877', 2023, 'Toyota', 'Camry', 'SE', 26400, 18950, '8-Speed Automatic', 'Front-Wheel Drive', 'Gasoline', 'Midnight Metallic', 'Fuel efficient sedan with full service records.', ARRAY['Apple CarPlay','Blind spot monitor','Fuel efficient','Service records'], 'available', false),
  ('2021-jeep-grand-cherokee', 'LM0765', 2021, 'Jeep', 'Grand Cherokee', 'Limited', 31900, 42300, '8-Speed Automatic', '4x4', 'Gasoline', 'Diamond Black', 'Well equipped Limited with new tires.', ARRAY['Heated steering wheel','Remote start','Trailer hitch','New tires'], 'available', false);

INSERT INTO public.vehicle_categories (vehicle_id, category_id)
SELECT v.id, c.id FROM public.vehicles v JOIN public.categories c ON
  (v.slug = '2024-bmw-x5' AND c.slug IN ('suv','luxury')) OR
  (v.slug = '2022-ford-f150' AND c.slug = 'truck') OR
  (v.slug = '2023-toyota-camry' AND c.slug IN ('sedan','budget')) OR
  (v.slug = '2021-jeep-grand-cherokee' AND c.slug = 'suv');