# Leslie Motors — admin dashboard, categories, WhatsApp button, logo & contact email

## What you'll get

**1. Real admin area (password-protected)**
- Sign-in page; only accounts you approve as admin can get in.
- Dashboard home with counts: total vehicles, listed, sold, categories, new messages.
- Manage vehicles: add, edit, delete, mark sold/available, set price, mileage, photos.
- Manage categories (SUV, Truck, Sedan, Luxury, Budget… you can add your own) and assign each vehicle to one or more.
- Messages inbox: every contact form submission saved and readable in the dashboard.
- Everything saves instantly and the public site updates in real time — no rebuild needed.

**2. Public site follows the admin data**
- Inventory page gets category filter tabs plus search and sort.
- Vehicle pages read live data instead of the placeholder cars.
- Placeholder demo cars are removed once you add real ones (I'll seed a few starter rows you can delete).

**3. Floating WhatsApp button**
- Round green WhatsApp bubble fixed bottom-right on every page, opens a chat to +1 309-259-5685 with a pre-filled message. On vehicle pages the message includes that car and stock number.

**4. Logo styling**
- Logo placed in a circular frame with a red-and-white double outline, in the header and footer.

**5. Contact form sends email**
- Form saves the message to the dashboard AND emails franckauto704@gmail.com.
- Sending email needs an email sender domain set up — I'll open that setup step for you. Until it's done, messages still arrive in the dashboard inbox.

**6. Fixes**
- Clear the current preview error and check every page, phone/WhatsApp/email/Facebook link, on mobile and desktop.

## Technical notes

- Enable Lovable Cloud (database + auth + storage).
- Tables: `vehicles`, `categories`, `vehicle_categories`, `vehicle_images`, `contact_messages`, `user_roles` + `has_role()` security-definer function. RLS: public read on listed vehicles/categories; all writes admin-only; messages insert-by-anyone, read admin-only.
- Vehicle photos in a Cloud storage bucket with admin-only write, public read.
- Admin routes under `src/routes/_authenticated/admin/*`; server functions in `*.functions.ts` with `requireSupabaseAuth` + role check.
- Real-time updates via Supabase realtime subscriptions on `vehicles`.
- Contact email via a server function using the scaffolded transactional email template.
- First admin: I'll grant the role to the account you sign up with, then you can promote others from the dashboard.

## Open item

I need to know which email/account you'll use as the admin login — or I can set it up so the first account that signs up becomes the admin.
