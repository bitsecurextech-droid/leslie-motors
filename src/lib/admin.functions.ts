import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Admin access is controlled by the ADMIN_EMAILS environment secret, never by
 * anything in the client bundle. A signed-in account only receives the admin
 * role when its verified email address is on that server-side list.
 */
export const syncAdminAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const allowList = (process.env["ADMIN_EMAILS"] ?? "")
      .split(/[,\s;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const email = String(context.claims["email"] ?? "").toLowerCase();
    const isAllowed = email.length > 0 && allowList.includes(email);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (isAllowed) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw error;
      return { isAdmin: true };
    }

    // Not on the list: make sure no stale admin role lingers on this account.
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", context.userId)
      .eq("role", "admin");
    if (error) throw error;
    return { isAdmin: false };
  });
