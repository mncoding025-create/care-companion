import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/companion/Sidebar";
import { CompanionJobsClient } from "./CompanionJobsClient";

export default async function CompanionJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: poolRows }, { data: broadcastRows }, { data: currentRows }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select(
          "id, service_type, scheduled_date, scheduled_time, pickup_address, destination_address"
        )
        .is("companion_id", null)
        .eq("status", "pending")
        .eq("is_emergency", false)
        .order("created_at", { ascending: true }),
      supabase
        .from("emergency_broadcasts")
        .select(
          "id, notified_at, booking:bookings!emergency_broadcasts_booking_id_fkey(id, status, companion_id, pickup_address, destination_address, details, customer:profiles!bookings_customer_id_fkey(full_name))"
        )
        .eq("companion_id", user.id)
        .eq("response", "pending")
        .order("notified_at", { ascending: true }),
      supabase
        .from("bookings")
        .select(
          "id, status, service_type, scheduled_time, pickup_address, destination_address, customer:profiles!bookings_customer_id_fkey(full_name, phone)"
        )
        .eq("companion_id", user.id)
        .in("status", ["accepted", "in_progress"])
        .order("created_at", { ascending: false }),
    ]);

  const regularJobs = (poolRows ?? []).map((r) => ({
    id: r.id,
    serviceType: r.service_type,
    scheduledDate: r.scheduled_date,
    scheduledTime: r.scheduled_time,
    pickupAddress: r.pickup_address,
    destinationAddress: r.destination_address,
  }));

  const emergencyJobs = (broadcastRows ?? [])
    .filter((b) => b.booking && b.booking.status === "pending" && !b.booking.companion_id)
    .map((b) => ({
      broadcastId: b.id,
      bookingId: b.booking!.id,
      notifiedAt: b.notified_at,
      pickupAddress: b.booking!.pickup_address,
      destinationAddress: b.booking!.destination_address,
      customerName: b.booking!.customer?.full_name ?? "",
      details: b.booking!.details,
    }));

  const currentJobs = (currentRows ?? []).map((r) => ({
    id: r.id,
    status: r.status,
    serviceType: r.service_type,
    scheduledTime: r.scheduled_time,
    pickupAddress: r.pickup_address,
    destinationAddress: r.destination_address,
    customerName: r.customer?.full_name ?? "",
    customerPhone: r.customer?.phone ?? null,
  }));

  return (
    <div className="flex min-h-screen">
      <Sidebar active="jobs" />
      <CompanionJobsClient
        regularJobs={regularJobs}
        emergencyJobs={emergencyJobs}
        currentJobs={currentJobs}
      />
    </div>
  );
}
