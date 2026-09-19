import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingTrackingClient } from "./BookingTrackingClient";

export default async function BookingTrackingPage({
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

  let companion: { full_name: string; phone: string | null } | null = null;
  if (booking.companion_id) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", booking.companion_id)
      .single();
    companion = data;
  }

  return <BookingTrackingClient initialBooking={booking} companion={companion} />;
}
