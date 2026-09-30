"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const REFRESH_INTERVAL_MS = 60_000;

export function LiveDataStream() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const refresh = () => {
      router.refresh();
    };

    const channel = supabase
      .channel("firealert-live-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, refresh);

    const subscription = channel.subscribe();
    const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
