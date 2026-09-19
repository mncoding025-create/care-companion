"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { firstName, initials } from "@/lib/format";
import type { Database } from "@/types/supabase";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

type CompanionInfo = {
  full_name: string;
  phone: string | null;
  rating_avg: number;
  vehicle_info: string | null;
};

const NO_RESPONSE_TIMEOUT_MS = 5 * 60 * 1000;

export function EmergencyStatusClient({
  initialBooking,
  initialCompanion,
}: {
  initialBooking: Booking;
  initialCompanion: CompanionInfo | null;
}) {
  const router = useRouter();
  const [booking, setBooking] = useState(initialBooking);
  const [companion, setCompanion] = useState(initialCompanion);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCallSuggestion, setShowCallSuggestion] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`emergency-${initialBooking.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${initialBooking.id}`,
        },
        async (payload) => {
          const updated = payload.new as Booking;
          setBooking(updated);
          if (updated.companion_id && !companion) {
            const [{ data: profile }, { data: details }] = await Promise.all([
              supabase
                .from("profiles")
                .select("full_name, phone")
                .eq("id", updated.companion_id)
                .single(),
              supabase
                .from("companion_details")
                .select("rating_avg, vehicle_info")
                .eq("profile_id", updated.companion_id)
                .single(),
            ]);
            if (profile) {
              setCompanion({
                full_name: profile.full_name,
                phone: profile.phone,
                rating_avg: details?.rating_avg ?? 0,
                vehicle_info: details?.vehicle_info ?? null,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBooking.id]);

  useEffect(() => {
    if (booking.companion_id) return;
    const timer = setTimeout(() => setShowCallSuggestion(true), NO_RESPONSE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [booking.companion_id]);

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
    setCancelOpen(false);
    router.push("/dashboard");
  }

  const found = !!booking.companion_id;
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="flex justify-center px-6 py-8 bg-bg-cream min-h-screen">
      <div className="w-full max-w-[720px] flex flex-col items-center gap-7 pt-6">
        <div className="flex items-center gap-2 bg-warm-red text-danger font-extrabold text-sm px-4 py-2 rounded-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
              stroke="#B3261E"
              strokeWidth="2"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
          คำขอความช่วยเหลือด่วน
        </div>

        {isCancelled ? (
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl font-extrabold text-center">
              คำขอนี้ถูกยกเลิกแล้ว
            </div>
          </div>
        ) : found ? (
          <div className="flex flex-col items-center gap-2">
            <div className="text-[26px] font-extrabold text-center">
              พบผู้ช่วยแล้ว 🎉
            </div>
            <div className="text-lg text-sub text-center">
              คุณ{firstName(companion?.full_name ?? "")}กำลังเดินทางมาหาคุณ
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div
              className="w-[150px] h-[150px] rounded-full bg-warm-red flex items-center justify-center"
              style={{ animation: "pulse 2.2s ease-out infinite" }}
            >
              <div className="w-[100px] h-[100px] rounded-full bg-danger flex items-center justify-center">
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l1.6 4.8L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.2L12 2z"
                    fill="#fff"
                  />
                </svg>
              </div>
            </div>
            <div className="text-[26px] font-extrabold text-center">
              กำลังติดต่อผู้ช่วย
              <br />
              ที่อยู่ใกล้คุณที่สุด...
            </div>
            <div className="text-lg text-sub text-center">
              กรุณารอสักครู่ เราไม่ทิ้งคุณไว้คนเดียวแน่นอน
            </div>
          </div>
        )}

        {showCallSuggestion && !found && !isCancelled && (
          <div className="w-full bg-card border-2 border-danger rounded-2xl px-5.5 py-4.5 flex items-center gap-4">
            <div className="flex-1 text-sm text-sub leading-relaxed">
              ยังไม่มีผู้ช่วยตอบรับคำขอของคุณ หากเป็นเหตุฉุกเฉินทางการแพทย์
              แนะนำให้โทรแจ้งหน่วยกู้ชีพโดยตรง
            </div>
            <a
              href="tel:1669"
              className="flex items-center gap-2 bg-danger text-white font-extrabold text-lg px-5.5 py-3.5 rounded-2xl shrink-0 no-underline"
            >
              โทร 1669
            </a>
          </div>
        )}

        {found && companion && !isCancelled && (
          <div className="w-full bg-card border-2 border-border rounded-[22px] p-7 flex flex-col gap-5">
            <div className="flex items-center gap-5">
              <div className="w-[88px] h-[88px] rounded-full bg-sky shrink-0 flex items-center justify-center text-[32px] font-extrabold text-primary-dark">
                {initials(companion.full_name)}
              </div>
              <div className="flex-1">
                <div className="text-[23px] font-extrabold">
                  {companion.full_name}
                </div>
                <div className="text-base text-sub mt-1">
                  ⭐ {companion.rating_avg.toFixed(1)}
                  {companion.vehicle_info ? ` · ${companion.vehicle_info}` : ""}
                </div>
              </div>
            </div>
            {companion.phone && (
              <a
                href={`tel:${companion.phone}`}
                className="flex items-center justify-center gap-3 min-h-[72px] rounded-[18px] bg-primary text-white text-xl font-extrabold shadow-[0_5px_0_var(--primary-dark)] no-underline w-full"
              >
                📞 โทรหาผู้ช่วยตอนนี้
              </a>
            )}
          </div>
        )}

        {!isCancelled && (
          <button
            onClick={() => setCancelOpen(true)}
            className="text-sm font-bold text-sub bg-card border-2 border-border rounded-2xl px-6 py-3.5 cursor-pointer"
          >
            ยกเลิกคำขอ
          </button>
        )}

        {isCancelled && (
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm font-bold text-sub bg-card border-2 border-border rounded-2xl px-6 py-3.5 cursor-pointer"
          >
            กลับหน้าแรก
          </button>
        )}
      </div>

      <ConfirmModal
        open={cancelOpen}
        title="ยกเลิกคำขอความช่วยเหลือ?"
        description="ผู้ช่วยที่กำลังเดินทางมาหาคุณจะได้รับแจ้งว่าคำขอถูกยกเลิก"
        confirmLabel="ใช่ ยกเลิกคำขอ"
        cancelLabel="ไม่ ยังต้องการความช่วยเหลือ"
        danger
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
      />

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(179,38,30,0.35); }
          70% { box-shadow: 0 0 0 40px rgba(179,38,30,0); }
          100% { box-shadow: 0 0 0 0 rgba(179,38,30,0); }
        }
      `}</style>
    </div>
  );
}
