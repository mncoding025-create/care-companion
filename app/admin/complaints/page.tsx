import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminComplaintsClient, type ComplaintRow } from "./AdminComplaintsClient";

export default async function AdminComplaintsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") redirect("/login");

  const { data: rows } = await supabase
    .from("complaints")
    .select(
      "id, category, description, status, is_urgent, created_at, reporter:profiles!complaints_reporter_id_fkey(full_name, phone), against:profiles!complaints_against_id_fkey(id, full_name, phone), booking:bookings(service_type)"
    )
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: false });

  const complaints: ComplaintRow[] = (rows ?? []).map((r) => ({
    id: r.id,
    category: r.category,
    description: r.description,
    status: r.status,
    isUrgent: r.is_urgent,
    createdAt: r.created_at,
    reporterName: r.reporter?.full_name ?? "—",
    reporterPhone: r.reporter?.phone ?? null,
    againstId: r.against?.id ?? null,
    againstName: r.against?.full_name ?? null,
    againstPhone: r.against?.phone ?? null,
    bookingServiceType: r.booking?.service_type ?? null,
  }));

  return (
    <div className="flex min-h-screen">
      <Sidebar active="complaints" />
      <AdminComplaintsClient complaints={complaints} />
    </div>
  );
}
