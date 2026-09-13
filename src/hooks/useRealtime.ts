import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Invalidate the given query key prefixes whenever any of the tables change. */
export function useRealtimeInvalidate(tables: string[], keys: string[]) {
  const queryClient = useQueryClient();
  const tableList = tables.join(",");
  const keyList = keys.join(",");

  useEffect(() => {
    const channel = supabase.channel(
      `rt:${tableList}:${keyList}:${Math.random().toString(36).slice(2)}`,
    );
    for (const table of tableList.split(",")) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        for (const key of keyList.split(",")) {
          void queryClient.invalidateQueries({ queryKey: [key] });
        }
      });
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, tableList, keyList]);
}
