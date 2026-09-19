import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/customer/Sidebar";
import {
  firstName,
  formatBookingDate,
  formatBookingTime,
  serviceTypeIcon,
  serviceTypeLabel,
} from "@/lib/format";
import type { Database } from "@/types/supabase";

const serviceCards: Database["public"]["Enums"]["service_type"][] = [
  "hospital",
  "shopping",
  "bank_government",
  "general",
];

export default async function CustomerDashboardPage() {
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

  const { data: upcoming } = await supabase
    .from("bookings")
    .select(
      "id, service_type, scheduled_date, scheduled_time, destination_address, companion:profiles!bookings_companion_id_fkey(full_name)"
    )
    .eq("customer_id", user.id)
    .not("status", "in", "(completed,cancelled)")
    .order("scheduled_date", { ascending: true, nullsFirst: false })
    .order("scheduled_time", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex min-h-screen">
      <Sidebar active="dashboard" fullName={fullName} />

      <div className="flex-1 px-5 py-6 md:px-14 md:py-10 flex flex-col gap-8 pb-24 md:pb-10">
        <div>
          <div className="text-[26px] md:text-[30px] font-extrabold text-ink">
            สวัสดีค่ะ คุณ{firstName(fullName)} 👋
          </div>
          <div className="text-lg text-sub mt-1.5">
            วันนี้มีธุระอะไรให้เราช่วยไหมคะ
          </div>
        </div>

        <Link
          href="/book"
          className="flex items-center justify-center gap-3 min-h-[64px] rounded-[18px] bg-accent text-white text-[22px] font-extrabold no-underline max-w-[420px] shadow-[0_5px_0_#C86F4F] active:scale-[0.98]"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>
          เรียกผู้ช่วยเดินทาง
        </Link>

        <div className="bg-card border border-border rounded-[20px] px-5 py-6 md:px-8 md:py-7 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 border-l-[6px] border-l-primary">
          <div className="w-14 h-14 rounded-2xl bg-mint flex items-center justify-center shrink-0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12h18M3 6h18M3 18h18"
                stroke="#2F7A68"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {upcoming ? (
            <>
              <div className="flex-1">
                <div className="text-xl font-bold text-ink">
                  การจองที่กำลังจะถึง
                </div>
                <div className="text-[17px] text-sub mt-1">
                  {formatBookingDate(upcoming.scheduled_date)}{" "}
                  {formatBookingTime(upcoming.scheduled_time)} —{" "}
                  {serviceTypeIcon(upcoming.service_type)} ไป
                  {upcoming.destination_address}{" "}
                  {upcoming.companion
                    ? `กับคุณ${firstName(upcoming.companion.full_name)}`
                    : "(รอผู้ช่วยตอบรับ)"}
                </div>
              </div>
              <Link
                href={`/booking/${upcoming.id}`}
                className="text-[17px] font-semibold text-primary-dark bg-mint no-underline rounded-xl px-4 py-2.5 whitespace-nowrap"
              >
                ดูรายละเอียด →
              </Link>
            </>
          ) : (
            <div className="flex-1">
              <div className="text-xl font-bold text-ink">
                การจองที่กำลังจะถึง
              </div>
              <div className="text-[17px] text-sub mt-1">
                ยังไม่มีการจองที่กำลังจะถึง
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="text-[22px] font-extrabold mb-4">บริการของเรา</div>
          <div className="grid grid-cols-2 md:flex gap-4 md:gap-6">
            {serviceCards.map((type) => (
              <Link
                key={type}
                href={`/book?service=${type}`}
                className="md:flex-1 bg-card border border-border rounded-2xl p-5 md:p-6 flex flex-col gap-2 md:gap-3 items-center text-center no-underline text-inherit"
              >
                <div className="text-4xl">{serviceTypeIcon(type)}</div>
                <div className="text-lg font-bold text-ink">
                  {serviceTypeLabel(type)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
