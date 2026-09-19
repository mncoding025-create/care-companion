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

      <div className="flex-1 px-5 py-6 md:px-14 md:py-10 flex flex-col gap-5 md:gap-6 pb-24 md:pb-10">
        <div className="text-[26px] md:text-[30px] font-extrabold text-ink">
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
              className="bg-card border border-border rounded-[20px] px-5 py-5 md:px-7 md:py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
            >
              <div className="flex items-center gap-4 flex-1">
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
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 pl-[68px] sm:pl-0">
                <span
                  className={`text-sm font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap ${
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
                <div className="text-lg font-bold sm:w-[90px] text-right text-ink">
                  {b.price ? `฿${b.price}` : <span className="text-sub">—</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
