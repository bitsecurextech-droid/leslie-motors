import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Car,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  Tags,
} from "lucide-react";
import { toast } from "sonner";
import { useIsAdmin, useSession } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/vehicles", label: "Vehicles", icon: Car, exact: false },
  { to: "/admin/categories", label: "Categories", icon: Tags, exact: false },
  { to: "/admin/messages", label: "Enquiries", icon: Inbox, exact: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, exact: false },
] as const;

function AdminLayout() {
  const { user } = useSession();
  const { data: isAdmin, isLoading } = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    void navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">Loading</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold uppercase tracking-tight">Access restricted</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account does not have dealership administrator permissions. Ask a super admin to grant
          access.
        </p>
        <button
          onClick={signOut}
          className="mt-6 rounded-md border border-border px-5 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-secondary"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Dealership PMS
        </p>
        <nav className="mt-4 flex flex-wrap gap-1 lg:flex-col">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <l.icon className="size-4" aria-hidden="true" />
              {l.label}
            </Link>
          ))}
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </nav>
        <p className="mt-4 hidden truncate text-xs text-muted-foreground lg:block">{user?.email}</p>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
