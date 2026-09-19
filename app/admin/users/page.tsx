import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminUsersClient, type AdminUserRow } from "./AdminUsersClient";

export default async function AdminUsersPage() {
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

  const [{ data: profiles }, { data: companionDetails }, { data: bookings }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, phone, is_active, role")
        .in("role", ["customer", "companion"]),
      supabase.from("companion_details").select("profile_id, is_verified, total_jobs"),
      supabase
        .from("bookings")
        .select("customer_id, status"),
    ]);

  const companionMap = new Map((companionDetails ?? []).map((c) => [c.profile_id, c]));
  const completedByCustomer = new Map<string, number>();
  for (const b of bookings ?? []) {
    if (b.status === "completed") {
      completedByCustomer.set(b.customer_id, (completedByCustomer.get(b.customer_id) ?? 0) + 1);
    }
  }

  const users: AdminUserRow[] = (profiles ?? []).map((p) => {
    const isCompanion = p.role === "companion";
    const details = companionMap.get(p.id);
    return {
      id: p.id,
      fullName: p.full_name,
      phone: p.phone,
      isActive: p.is_active,
      role: isCompanion ? "companion" : "customer",
      isVerified: details?.is_verified ?? false,
      usageCount: isCompanion
        ? details?.total_jobs ?? 0
        : completedByCustomer.get(p.id) ?? 0,
    };
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar active="users" />
      <AdminUsersClient users={users} />
    </div>
  );
}
