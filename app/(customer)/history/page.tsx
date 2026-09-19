import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/customer/Sidebar";
import { firstName, formatBookingDate, serviceTypeIcon, serviceTypeLabel } from "@/lib/format";

export default async function BookingHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const fullName = profile?.full_name ?? "";

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, service_type, scheduled_date, status, price, cancelled_at, companion:profiles!bookings_companion_id_fkey(full_name)"
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen">
      <Sidebar active="history" fullName={fullName} />

      <div className="flex-1 px-14 py-10 flex flex-col gap-6">
        <div className="text-[30px] font-extrabold text-ink">
          ประวัติการใช้บริการ
        </div>

        {(bookings ?? []).length === 0 && (
          <div className="bg-card border border-border rounded-[20px] px-8 py-10 text-center text-lg text-sub">
            ยังไม่มีประวัติการใช้บริการ
          </div>
        )}

        {(bookings ?? []).map((b) => {
          const isDone = b.status === "completed";
          const isCancelled = b.status === "cancelled";
          return (
            <div
              key={b.id}
              className="bg-card border border-border rounded-[20px] px-7 py-6 flex items-center gap-6"
            >
              <div
                className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  isCancelled ? "bg-warm-red" : "bg-mint"
                }`}
              >
                {serviceTypeIcon(b.service_type)}
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-ink">
                  {serviceTypeLabel(b.service_type)}
                </div>
                <div className="text-sm text-sub mt-1">
                  {formatBookingDate(b.scheduled_date)}
                  {isCancelled
                    ? " · ยกเลิกโดยผู้ใช้"
                    : b.companion
                    ? ` · กับคุณ${firstName(b.companion.full_name)}`
                    : ""}
                </div>
              </div>
              <span
                className={`text-sm font-bold px-3.5 py-1.5 rounded-full ${
                  isDone
                    ? "bg-mint text-primary-dark"
                    : isCancelled
                    ? "bg-warm-red text-danger"
                    : "bg-sky text-primary-dark"
                }`}
              >
                {isDone
                  ? "เสร็จสิ้น"
                  : isCancelled
                  ? "ยกเลิกแล้ว"
                  : "กำลังดำเนินการ"}
              </span>
              <div className="text-lg font-bold w-[90px] text-right text-ink">
                {b.price ? `฿${b.price}` : <span className="text-sub">—</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
