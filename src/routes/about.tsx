import { createFileRoute } from "@tanstack/react-router";
import { Facebook } from "lucide-react";
import { ContactActions } from "@/components/ContactActions";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About - Leslie Motor Co." },
      {
        name: "description",
        content:
          "Leslie Motor Co. is a family-run dealership focused on honest pricing and dependable pre-owned vehicles.",
      },
      { property: "og:title", content: "About - Leslie Motor Co." },
      {
        property: "og:description",
        content: "A family-run dealership focused on honest pricing and dependable vehicles.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight">About {siteConfig.name}</h1>
      <p className="mt-5 text-muted-foreground">
        We're a family-run dealership built on repeat customers and word of mouth. Every vehicle we
        list is inspected, priced honestly, and backed by people who answer the phone.
      </p>
      <p className="mt-4 text-muted-foreground">
        Whether you're buying your first car or replacing the work truck, we'll walk you through the
        numbers with no pressure and no games.
      </p>

      <a
        href={siteConfig.contact.facebookGroupUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-secondary"
      >
        <Facebook className="size-4" aria-hidden="true" />
        Join our Facebook Group
      </a>

      <h2 className="mt-12 text-xl font-bold uppercase tracking-tight">Talk to us</h2>
      <ContactActions
        className="mt-5"
        showFacebook={false}
        whatsappMessage={`Hello ${siteConfig.shortName}, I'd like to learn more about your dealership.`}
      />
    </div>
  );
}
