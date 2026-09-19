"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatBookingDate, formatBookingTime, serviceTypeIcon, serviceTypeLabel } from "@/lib/format";
import type { Database } from "@/types/supabase";

type ServiceType = Database["public"]["Enums"]["service_type"];
type BookingStatus = Database["public"]["Enums"]["booking_status"];

export type RegularJob = {
  id: string;
  serviceType: ServiceType;
  scheduledDate: string | null;
  scheduledTime: string | null;
  pickupAddress: string;
  destinationAddress: string;
};

export type EmergencyJob = {
  broadcastId: string;
  bookingId: string;
  notifiedAt: string;
  pickupAddress: string;
  destinationAddress: string;
  customerName: string;
  details: string | null;
};

export type CurrentJob = {
  id: string;
  status: BookingStatus;
  serviceType: ServiceType;
  scheduledTime: string | null;
  pickupAddress: string;
  destinationAddress: string;
  customerName: string;
  customerPhone: string | null;
};

const BROADCAST_WINDOW_MS = 5 * 60 * 1000;

export function CompanionJobsClient({
  regularJobs,
  emergencyJobs,
  currentJobs,
}: {
  regularJobs: RegularJob[];
  emergencyJobs: EmergencyJob[];
  currentJobs: CurrentJob[];
}) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const refresh = setInterval(() => router.refresh(), 20000);
    return () => {
      clearInterval(tick);
      clearInterval(refresh);
    };
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function acceptEmergency(bookingId: string) {
    setBusyId(bookingId);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: won } = await supabase.rpc("accept_emergency_job", {
      p_booking_id: bookingId,
      p_companion_id: user.id,
    });
    setBusyId(null);
    setToast(won ? "รับงานฉุกเฉินสำเร็จ" : "งานนี้ถูกผู้ช่วยคนอื่นรับไปแล้ว");
    router.refresh();
  }

  async function declineEmergency(broadcastId: string) {
    const supabase = createClient();
    await supabase
      .from("emergency_broadcasts")
      .update({ response: "declined", responded_at: new Date().toISOString() })
      .eq("id", broadcastId);
    router.refresh();
  }

  async function acceptRegular(id: string) {
    setBusyId(id);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("bookings")
      .update({
        companion_id: user.id,
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .is("companion_id", null)
      .select("id")
      .maybeSingle();
    setBusyId(null);
    setToast(data ? "รับงานสำเร็จ" : "งานนี้ถูกผู้ช่วยคนอื่นรับไปแล้ว");
    router.refresh();
  }

  function declineRegular(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  async function advanceStatus(job: CurrentJob) {
    setBusyId(job.id);
    const supabase = createClient();
    if (job.status === "accepted") {
      await supabase.from("bookings").update({ status: "in_progress" }).eq("id", job.id);
    } else {
      await supabase
        .from("bookings")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", job.id);
    }
    setBusyId(null);
    router.refresh();
  }

  const visibleRegularJobs = regularJobs.filter((j) => !dismissed.has(j.id));

  return (
    <div className="flex-1 px-14 py-10 flex gap-10">
      <div className="flex-1 max-w-[640px] flex flex-col gap-6">
        <div className="text-[30px] font-extrabold text-ink">งานที่เข้ามาใหม่</div>

        {toast && (
          <div className="bg-mint text-primary-dark font-semibold text-sm px-4 py-3 rounded-xl">
            {toast}
          </div>
        )}

        {emergencyJobs.map((job) => {
          const remainingMs = job.notifiedAt
            ? BROADCAST_WINDOW_MS - (now - new Date(job.notifiedAt).getTime())
            : 0;
          const expired = remainingMs <= 0;
          const minutes = Math.max(0, Math.floor(remainingMs / 60000));
          const seconds = Math.max(0, Math.floor((remainingMs % 60000) / 1000));

          return (
            <div
              key={job.broadcastId}
              className="bg-[#FFFBFA] rounded-[20px] border-[3px] border-danger relative flex flex-col gap-4 p-6.5"
            >
              <div className="absolute -top-3.5 left-5 bg-danger text-white text-sm font-extrabold px-3.5 py-1.5 rounded-full shadow-[0_3px_8px_rgba(179,38,30,0.3)]">
                🔴 ด่วน
              </div>
              <div className="mt-2 text-[19px] font-extrabold">
                🏥 พาไปหาหมอ (คำขอฉุกเฉิน)
              </div>
              <div className="text-base text-sub leading-relaxed">
                📅 ทันที
                <br />
                📍 จาก: {job.pickupAddress}
                <br />
                🏁 ถึง: {job.destinationAddress}
                <br />
                👤 ลูกค้า: คุณ{job.customerName}
                {job.details ? ` (${job.details})` : ""}
              </div>
              <div className="flex items-center justify-between bg-warm-red rounded-2xl px-4.5 py-3">
                <span className="text-sm font-bold text-danger">
                  เหลือเวลาตอบรับ
                </span>
                <span className="text-2xl font-extrabold text-danger tracking-wide">
                  {expired ? "หมดเวลา" : `${minutes}:${String(seconds).padStart(2, "0")} นาที`}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => acceptEmergency(job.bookingId)}
                  disabled={expired || busyId === job.bookingId}
                  className="flex-1 min-h-[64px] rounded-2xl bg-danger text-white text-lg font-bold border-none cursor-pointer disabled:opacity-50"
                >
                  {busyId === job.bookingId ? "กำลังรับงาน..." : "รับงานนี้"}
                </button>
                <button
                  onClick={() => declineEmergency(job.broadcastId)}
                  className="flex-1 min-h-[56px] rounded-2xl bg-card border-2 border-danger text-danger text-[17px] font-bold cursor-pointer"
                >
                  ปฏิเสธ
                </button>
              </div>
            </div>
          );
        })}

        {visibleRegularJobs.map((job) => (
          <div
            key={job.id}
            className="bg-card border border-border rounded-[20px] p-6.5 flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-[19px] font-extrabold">
                {serviceTypeIcon(job.serviceType)} {serviceTypeLabel(job.serviceType)}
              </span>
              <span className="text-sm text-sub">
                {formatBookingDate(job.scheduledDate)} {formatBookingTime(job.scheduledTime)}
              </span>
            </div>
            <div className="text-base text-sub leading-relaxed">
              📍 จาก: {job.pickupAddress}
              <br />
              🏁 ถึง: {job.destinationAddress}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => acceptRegular(job.id)}
                disabled={busyId === job.id}
                className="flex-1 min-h-[56px] rounded-2xl bg-primary text-white text-[17px] font-bold border-none cursor-pointer disabled:opacity-50"
              >
                {busyId === job.id ? "กำลังรับงาน..." : "รับงานนี้"}
              </button>
              <button
                onClick={() => declineRegular(job.id)}
                className="flex-1 min-h-[56px] rounded-2xl bg-card border-2 border-danger text-danger text-[17px] font-bold cursor-pointer"
              >
                ปฏิเสธ
              </button>
            </div>
          </div>
        ))}

        {emergencyJobs.length === 0 && visibleRegularJobs.length === 0 && (
          <div className="bg-card border border-border rounded-[20px] px-8 py-10 text-center text-lg text-sub">
            ยังไม่มีงานใหม่เข้ามาตอนนี้
          </div>
        )}
      </div>

      <div className="w-[400px] flex flex-col gap-5">
        <div className="text-[22px] font-extrabold">สถานะงานปัจจุบัน</div>

        {currentJobs.length === 0 && (
          <div className="bg-card border border-border rounded-[20px] px-6 py-8 text-center text-base text-sub">
            ยังไม่มีงานที่กำลังดำเนินการ
          </div>
        )}

        {currentJobs.map((job) => (
          <div
            key={job.id}
            className="bg-mint rounded-[20px] p-6.5 flex flex-col gap-4"
          >
            <span className="text-sm font-bold text-primary-dark">
              {job.status === "accepted"
                ? "🚗 กำลังเดินทางไปรับลูกค้า"
                : "🚗 กำลังเดินทางไปส่งลูกค้า"}
            </span>
            <div className="text-lg font-extrabold">คุณ{job.customerName}</div>
            <div className="text-sm text-primary-dark">
              {serviceTypeLabel(job.serviceType)}
              {job.scheduledTime ? ` · ${formatBookingTime(job.scheduledTime)}` : ""}
            </div>
            <div className="flex gap-2.5">
              {job.customerPhone && (
                <a
                  href={`tel:${job.customerPhone}`}
                  className="flex-1 min-h-[52px] rounded-2xl bg-white text-primary-dark text-base font-bold flex items-center justify-center no-underline"
                >
                  📞 โทรหาลูกค้า
                </a>
              )}
            </div>
            <button
              onClick={() => advanceStatus(job)}
              disabled={busyId === job.id}
              className="min-h-[52px] rounded-2xl bg-primary text-white text-base font-bold border-none cursor-pointer disabled:opacity-50"
            >
              {busyId === job.id
                ? "กำลังอัปเดต..."
                : job.status === "accepted"
                ? "✓ ถึงจุดรับแล้ว"
                : "✓ เสร็จสิ้นงาน"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
