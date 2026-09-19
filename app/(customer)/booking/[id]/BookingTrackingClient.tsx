"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { initials } from "@/lib/format";
import type { Database } from "@/types/supabase";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export function BookingTrackingClient({
  initialBooking,
  companion,
}: {
  initialBooking: Booking;
  companion: { full_name: string; phone: string | null } | null;
}) {
  const router = useRouter();
  const [booking, setBooking] = useState(initialBooking);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`booking-${initialBooking.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${initialBooking.id}`,
        },
        (payload) => {
          setBooking(payload.new as Booking);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialBooking.id]);

  async function handleCancel() {
    setCancelling(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: user?.id,
      })
      .eq("id", booking.id);
    setCancelling(false);
    setConfirmOpen(false);
    router.refresh();
  }

  const isConfirmed = booking.status === "accepted" || booking.status === "in_progress";
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="flex justify-center px-6 py-12">
      <div className="w-full max-w-[760px] flex flex-col gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[17px] font-bold text-sub no-underline w-fit"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="#5B584D"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          กลับหน้าแรก
        </Link>

        <div className="text-[30px] font-extrabold text-ink">
          ติดตามสถานะการเดินทาง
        </div>

        <div className="bg-mint rounded-[20px] px-8 py-7 flex items-center gap-5">
          <div className="w-[60px] h-[60px] rounded-full bg-white flex items-center justify-center text-[28px] shrink-0">
            {isCompleted ? "✅" : isCancelled ? "🚫" : booking.companion_id ? "🚗" : "⏳"}
          </div>
          <div className="flex-1">
            <div className="text-[22px] font-extrabold text-primary-dark">
              {isCancelled
                ? "การจองนี้ถูกยกเลิกแล้ว"
                : isCompleted
                ? "เดินทางเสร็จสิ้นแล้ว"
                : isConfirmed
                ? "ผู้ช่วยกำลังเดินทางมารับคุณ"
                : booking.companion_id
                ? "ยืนยันการจองแล้ว"
                : "กำลังรอผู้ช่วยตอบรับ..."}
            </div>
          </div>
        </div>

        {companion && !isCancelled && (
          <div className="bg-card border border-border rounded-[20px] px-8 py-7 flex items-center gap-5">
            <div className="w-[72px] h-[72px] rounded-full bg-sky shrink-0 flex items-center justify-center text-[26px] font-extrabold text-primary-dark">
              {initials(companion.full_name)}
            </div>
            <div className="flex-1">
              <div className="text-xl font-extrabold text-ink">
                {companion.full_name}
              </div>
              {companion.phone && (
                <div className="text-base text-sub">{companion.phone}</div>
              )}
            </div>
            {companion.phone && (
              <a
                href={`tel:${companion.phone}`}
                className="min-h-[52px] flex items-center justify-center gap-2.5 rounded-2xl bg-primary text-white text-lg font-bold no-underline px-5"
              >
                📞 โทร
              </a>
            )}
          </div>
        )}

        <div className="bg-card border border-border rounded-[20px] p-8 flex flex-col gap-6">
          <div className="text-xl font-extrabold text-ink">
            รายละเอียดการเดินทาง
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-base shrink-0">
              ✓
            </div>
            <div>
              <div className="text-lg font-bold text-ink">
                ยืนยันการจองแล้ว
              </div>
              <div className="text-sm text-sub">
                {new Date(booking.created_at).toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                น.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 ${
                booking.companion_id ? "bg-accent text-white" : "bg-border text-sub"
              }`}
            >
              🚗
            </div>
            <div>
              <div
                className={`text-lg font-bold ${
                  booking.companion_id ? "text-ink" : "text-sub"
                }`}
              >
                ผู้ช่วยกำลังเดินทางมารับ
              </div>
              <div className="text-sm text-sub">
                จุดรับ: {booking.pickup_address}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 ${
                isCompleted ? "bg-primary text-white" : "bg-border text-sub"
              }`}
            >
              {isCompleted ? "✓" : "⏳"}
            </div>
            <div>
              <div
                className={`text-lg font-bold ${
                  isCompleted ? "text-ink" : "text-sub"
                }`}
              >
                ถึงจุดหมาย
              </div>
              <div className="text-sm text-sub">
                {booking.destination_address}
              </div>
            </div>
          </div>
        </div>

        {!isCompleted && !isCancelled && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="min-h-[56px] flex items-center justify-center gap-2.5 rounded-2xl bg-card text-danger border-2 border-danger text-lg font-bold cursor-pointer"
          >
            ยกเลิกการจอง
          </button>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="ยกเลิกการจองนี้ใช่ไหมคะ?"
        description="เมื่อยกเลิกแล้วจะไม่สามารถย้อนกลับได้ ผู้ช่วยจะได้รับแจ้งว่าการจองถูกยกเลิก"
        confirmLabel="ใช่ ยกเลิกการจอง"
        cancelLabel="ไม่ยกเลิก"
        danger
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
