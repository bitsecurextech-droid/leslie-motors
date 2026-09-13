import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { mailtoHref, siteConfig, telHref, whatsappHref } from "@/config/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Leslie Motor Co. - Call, WhatsApp or Email" },
      {
        name: "description",
        content:
          "Contact Leslie Motor Co. Phone +1 315-367-2420, WhatsApp +1 309-259-5685, email franckauto704@gmail.com, or join our Facebook Group.",
      },
      { property: "og:title", content: "Contact Leslie Motor Co." },
      {
        property: "og:description",
        content: "Call, WhatsApp, email, or join the official Leslie Motors Facebook Group.",
      },
    ],
  }),
  component: ContactPage,
});

const cardClass =
  "flex items-start gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary";

function ContactPage() {
  const { contact } = siteConfig;
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);

  const emailBody = `Name: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\n\n${form.message}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        message: form.message,
        source: "contact_page",
      });
      if (error) throw error;
      toast.success("Message sent. We will get back to you shortly.");
      window.location.href = mailtoHref(
        `Website enquiry from ${form.name || "a customer"}`,
        emailBody,
      );
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      toast.error("Could not send your message. Please call or WhatsApp us instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight">Contact {siteConfig.shortName}</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Pick whichever way is easiest - we answer all of them.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a href={telHref()} className={cardClass}>
          <Phone className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold uppercase tracking-wide">Call Dealership</span>
            <span className="mt-1 block text-sm text-muted-foreground">{contact.phoneDisplay}</span>
          </span>
        </a>
        <a
          href={whatsappHref(`Hello ${siteConfig.shortName}, I have a question.`)}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClass}
        >
          <MessageCircle className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold uppercase tracking-wide">WhatsApp</span>
            <span className="mt-1 block text-sm text-muted-foreground">{contact.whatsappDisplay}</span>
          </span>
        </a>
        <a href={mailtoHref()} className={cardClass}>
          <Mail className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold uppercase tracking-wide">Email Us</span>
            <span className="mt-1 block break-all text-sm text-muted-foreground">{contact.email}</span>
          </span>
        </a>
        <a
          href={contact.facebookGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClass}
        >
          <Facebook className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold uppercase tracking-wide">Facebook Group</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Official Leslie Motors Facebook Group
            </span>
          </span>
        </a>
      </div>

      <section className="mt-14 rounded-lg border border-border bg-card p-8">
        <h2 className="text-xl font-bold uppercase tracking-tight">Send a message</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your message reaches our team instantly and we also open your email app addressed to{" "}
          {contact.email}.
        </p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm">
            <span className="mb-2 block font-medium">Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm">
            <span className="mb-2 block font-medium">Phone</span>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-2 block font-medium">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-2 block font-medium">Message</span>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-fit rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Sending" : "Send Message"}
          </button>
        </form>
      </section>
    </div>
  );
}
