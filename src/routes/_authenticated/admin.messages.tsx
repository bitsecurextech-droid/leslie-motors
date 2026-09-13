import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Mail, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeInvalidate } from "@/hooks/useRealtime";
import { messagesQueryOptions } from "@/lib/inventory";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: AdminMessages,
});

function AdminMessages() {
  useRealtimeInvalidate(["contact_messages"], ["contact_messages"]);
  const queryClient = useQueryClient();
  const { data: messages = [] } = useQuery(messagesQueryOptions);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["contact_messages"] });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enquiry deleted");
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold uppercase tracking-tight">Enquiries</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every website enquiry lands here in real time.
      </p>

      <ul className="mt-6 space-y-4">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-lg border bg-card p-5 ${m.is_read ? "border-border" : "border-primary"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString("en-US")} via {m.source}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!m.is_read && (
                  <button
                    onClick={() => markRead.mutate(m.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:bg-secondary"
                  >
                    <Check className="size-3.5" aria-hidden="true" />
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => remove.mutate(m.id)}
                  aria-label="Delete enquiry"
                  className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-primary"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {m.phone && (
                <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                  <Phone className="size-3.5" aria-hidden="true" />
                  {m.phone}
                </a>
              )}
              {m.email && (
                <a
                  href={`mailto:${m.email}`}
                  className="inline-flex items-center gap-1 break-all hover:text-primary"
                >
                  <Mail className="size-3.5" aria-hidden="true" />
                  {m.email}
                </a>
              )}
            </div>
          </li>
        ))}
        {messages.length === 0 && (
          <li className="rounded-lg border border-border bg-card px-5 py-6 text-sm text-muted-foreground">
            No enquiries yet.
          </li>
        )}
      </ul>
    </div>
  );
}
