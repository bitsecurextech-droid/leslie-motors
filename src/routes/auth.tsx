import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LogIn, ShieldCheck } from "lucide-react";
import { syncAdminAccess } from "@/lib/admin.functions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useAuth";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff Login | Leslie Motor Co." },
      {
        name: "description",
        content:
          "Secure staff and administrator login for the Leslie Motor Co. dealership management dashboard.",
      },
      { property: "og:title", content: "Staff Login | Leslie Motor Co." },
      {
        property: "og:description",
        content: "Secure staff login for the Leslie Motor Co. management dashboard.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const syncAccess = useServerFn(syncAdminAccess);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await syncAccess();
        toast.success("Signed in");
        void navigate({ to: "/admin", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-lg border border-border bg-card p-8">
        <ShieldCheck className="size-7 text-primary" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-extrabold uppercase tracking-tight">Staff Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Authorized {siteConfig.shortName} staff only. Customers can reach us by phone, WhatsApp or
          email.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="text-sm">
              <span className="mb-2 block font-medium">Full name</span>
              <input
                className={inputClass}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </label>
          )}
          <label className="text-sm">
            <span className="mb-2 block font-medium">Email</span>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="text-sm">
            <span className="mb-2 block font-medium">Password</span>
            <input
              type="password"
              minLength={6}
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <LogIn className="size-4" aria-hidden="true" />
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>


        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 text-sm text-primary hover:underline"
        >
          {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
