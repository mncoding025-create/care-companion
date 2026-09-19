import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/Sidebar";
import { serviceTypeLabel } from "@/lib/format";
import type { Database } from "@/types/supabase";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

const statusBadge: Record<BookingStatus, { label: string; bg: string; color: string }> = {
  pending: { label: "รอผู้ช่วยตอบรับ", bg: "#EAF2FB", color: "#2F6FA6" },
  accepted: { label: "กำลังเดินทาง", bg: "var(--mint)", color: "var(--primary-dark)" },
  in_progress: { label: "กำลังเดินทาง", bg: "var(--mint)", color: "var(--primary-dark)" },
  completed: { label: "เสร็จสิ้น", bg: "#F1F1E8", color: "var(--sub)" },
  cancelled: { label: "ยกเลิกแล้ว", bg: "var(--warm-red)", color: "var(--danger)" },
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/login");

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const [
    { count: bookingsToday },
    { count: bookingsYesterday },
    { count: totalCompanions },
    { count: verifiedCompanions },
    { count: totalCustomers },
    { count: pendingComplaints },
    { count: urgentComplaints },
    { data: recentBookings },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfToday.toISOString()),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfYesterday.toISOString())
      .lt("created_at", startOfToday.toISOString()),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "companion"),
    supabase
      .from("companion_details")
      .select("profile_id", { count: "exact", head: true })
      .eq("is_verified", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .neq("status", "resolved"),
    supabase
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .neq("status", "resolved")
      .eq("is_urgent", true),
    supabase
      .from("bookings")
      .select(
        "id, service_type, status, customer:profiles!bookings_customer_id_fkey(full_name), companion:profiles!bookings_companion_id_fkey(full_name)"
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const today = bookingsToday ?? 0;
  const yesterday = bookingsYesterday ?? 0;
  let trendLabel: string;
  if (yesterday === 0) {
    trendLabel = today > 0 ? `+${today} รายการจากเมื่อวาน` : "ไม่มีข้อมูลเปรียบเทียบ";
  } else {
    const pct = Math.round(((today - yesterday) / yesterday) * 100);
    trendLabel = `${pct >= 0 ? "▲" : "▼"} ${Math.abs(pct)}% จากเมื่อวาน`;
  }

  const totalUsers = (totalCustomers ?? 0) + (totalCompanions ?? 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar active="dashboard" />

      <div className="flex-1 px-14 py-10 flex flex-col gap-7">
        <div className="text-[30px] font-extrabold text-ink">ภาพรวมระบบ</div>

        <div className="flex gap-5">
          <div className="flex-1 bg-card border border-border rounded-[18px] p-6">
            <div className="text-[15px] font-semibold text-sub">การจองวันนี้</div>
            <div className="text-[32px] font-extrabold mt-1.5">{today}</div>
            <div className="text-sm text-primary mt-1">{trendLabel}</div>
          </div>
          <div className="flex-1 bg-card border border-border rounded-[18px] p-6">
            <div className="text-[15px] font-semibold text-sub">
              ผู้ช่วยที่ยืนยันตัวตนแล้ว
            </div>
            <div className="text-[32px] font-extrabold mt-1.5">
              {verifiedCompanions ?? 0}
            </div>
            <div className="text-sm text-sub mt-1">
              จากทั้งหมด {totalCompanions ?? 0} คน
            </div>
          </div>
          <div className="flex-1 bg-card border border-border rounded-[18px] p-6">
            <div className="text-[15px] font-semibold text-sub">ผู้ใช้งานทั้งหมด</div>
            <div className="text-[32px] font-extrabold mt-1.5">{totalUsers}</div>
            <div className="text-sm text-sub mt-1">
              ลูกค้า {totalCustomers ?? 0} · ผู้ช่วย {totalCompanions ?? 0}
            </div>
          </div>
          <div className="flex-1 bg-card border rounded-[18px] p-6" style={{ borderColor: "#F3D5CE" }}>
            <div className="text-[15px] font-semibold text-sub">
              ข้อร้องเรียนค้างอยู่
            </div>
            <div className="text-[32px] font-extrabold mt-1.5 text-danger">
              {pendingComplaints ?? 0}
            </div>
            <div className="text-sm text-danger mt-1">
              ต้องตรวจสอบด่วน {urgentComplaints ?? 0} รายการ
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[18px] p-8">
          <div className="text-xl font-extrabold mb-5">การจองล่าสุด</div>
          <div className="flex flex-col">
            <div className="flex py-3.5 border-b border-border text-[15px] font-bold text-sub">
              <div className="w-[180px]">ลูกค้า</div>
              <div className="w-[180px]">ผู้ช่วย</div>
              <div className="flex-1">ธุระ</div>
              <div className="w-[140px]">สถานะ</div>
            </div>
            {(recentBookings ?? []).map((b) => {
              const badge = statusBadge[b.status];
              return (
                <div
                  key={b.id}
                  className="flex py-4 border-b border-border last:border-b-0 text-base items-center"
                >
                  <div className="w-[180px]">{b.customer?.full_name ?? "—"}</div>
                  <div className="w-[180px]">{b.companion?.full_name ?? "—"}</div>
                  <div className="flex-1">{serviceTypeLabel(b.service_type)}</div>
                  <div className="w-[140px]">
                    <span
                      className="text-sm font-bold px-3 py-1.5 rounded-full"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
            {(recentBookings ?? []).length === 0 && (
              <div className="py-8 text-center text-sub">ยังไม่มีการจอง</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
