import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BookingIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: active } = await supabase
    .from("bookings")
    .select("id")
    .eq("customer_id", user.id)
    .not("status", "in", "(completed,cancelled)")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  redirect(active ? `/booking/${active.id}` : "/history");
}
