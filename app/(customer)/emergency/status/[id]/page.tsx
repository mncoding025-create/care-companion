import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmergencyStatusClient } from "./EmergencyStatusClient";

export default async function EmergencyStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (!booking) notFound();

  let companion = null;
  if (booking.companion_id) {
    const [{ data: profile }, { data: details }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", booking.companion_id)
        .single(),
      supabase
        .from("companion_details")
        .select("rating_avg, vehicle_info")
        .eq("profile_id", booking.companion_id)
        .single(),
    ]);
    if (profile) {
      companion = {
        full_name: profile.full_name,
        phone: profile.phone,
        rating_avg: details?.rating_avg ?? 0,
        vehicle_info: details?.vehicle_info ?? null,
      };
    }
  }

  return (
    <EmergencyStatusClient initialBooking={booking} initialCompanion={companion} />
  );
}
