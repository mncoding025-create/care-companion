"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

// TODO: replace with a real "nearby places" API (e.g. Google Places) once an
// API key is available. For now this is a static mock list, per PLAN Phase 3.
const mockDestinations = [
  { id: "d1", name: "โรงพยาบาลศิริราช", meta: "ห่างจากคุณ 1.8 กม. · ประมาณ 6 นาที", icon: "🏥" },
  { id: "d2", name: "คลินิกใกล้บ้าน หมอสมชาย", meta: "ห่างจากคุณ 0.8 กม. · ประมาณ 3 นาที", icon: "⚕️" },
  { id: "d3", name: "โรงพยาบาลธนบุรี", meta: "ห่างจากคุณ 3.2 กม. · ประมาณ 11 นาที", icon: "🏥" },
];

export function EmergencyConfirmClient({
  userId,
  savedAddress,
}: {
  userId: string;
  savedAddress: string;
}) {
  const router = useRouter();
  const [locating, setLocating] = useState(true);
  const [locationLabel, setLocationLabel] = useState("");
  const [pickupAddress, setPickupAddress] = useState(savedAddress);
  const [selectedDest, setSelectedDest] = useState<string>("d1");
  const [customDestination, setCustomDestination] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      const timer = setTimeout(() => {
        setLocating(false);
        setLocationLabel(
          savedAddress
            ? `ใช้ที่อยู่ที่บันทึกไว้: ${savedAddress}`
            : "ไม่พบตำแหน่งอัตโนมัติ กรุณากรอกที่อยู่ปัจจุบันด้านล่าง"
        );
      }, 0);
      return () => clearTimeout(timer);
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setPickupAddress((prev) => prev || `ตำแหน่ง GPS (${coords})`);
        setLocationLabel("ระบบตรวจพบตำแหน่งปัจจุบันของคุณแล้ว");
        setLocating(false);
      },
      () => {
        setLocationLabel(
          savedAddress
            ? `ไม่สามารถเข้าถึงตำแหน่งได้ — ใช้ที่อยู่ที่บันทึกไว้: ${savedAddress}`
            : "ไม่สามารถเข้าถึงตำแหน่งได้ กรุณากรอกที่อยู่ปัจจุบันด้านล่าง"
        );
        setLocating(false);
      },
      { timeout: 8000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const destinationName =
    selectedDest === "custom"
      ? customDestination
      : mockDestinations.find((d) => d.id === selectedDest)?.name ?? "";

  async function handleConfirm() {
    if (!pickupAddress.trim() || !destinationName.trim()) {
      setError("กรุณาระบุจุดรับและปลายทางก่อนยืนยัน");
      setModalOpen(false);
      return;
    }
    setSubmitting(true);
    setError("");

    const supabase = createClient();

    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        customer_id: userId,
        service_type: "hospital",
        pickup_address: pickupAddress,
        destination_address: destinationName,
        is_emergency: true,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !booking) {
      setError("ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setSubmitting(false);
      setModalOpen(false);
      return;
    }

    const { data: companions } = await supabase
      .from("companion_details")
      .select("profile_id, service_areas")
      .eq("is_verified", true);

    const haystack = `${pickupAddress} ${destinationName}`.toLowerCase();
    const allIds = (companions ?? []).map((c) => c.profile_id);
    const matchedIds = (companions ?? [])
      .filter((c) => c.service_areas.some((a) => haystack.includes(a.toLowerCase())))
      .map((c) => c.profile_id);
    const targetIds = matchedIds.length > 0 ? matchedIds : allIds;

    if (targetIds.length > 0) {
      await supabase.from("emergency_broadcasts").insert(
        targetIds.map((companionId) => ({
          booking_id: booking.id,
          companion_id: companionId,
          response: "pending" as const,
        }))
      );
    }

    router.push(`/emergency/status/${booking.id}`);
  }

  return (
    <div className="flex justify-center px-4 py-6 md:px-6 md:py-8 bg-bg-cream min-h-screen">
      <div className="w-full max-w-[820px] flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[17px] font-bold text-sub bg-transparent border-none cursor-pointer p-0"
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
            ยกเลิก กลับหน้าแรก
          </button>
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
            ขอความช่วยเหลือด่วน
          </div>
        </div>

        <div>
          <div className="text-[28px] font-extrabold text-ink">
            ยืนยันคำขอความช่วยเหลือ
          </div>
          <div className="text-[17px] text-sub mt-1.5">
            ใจเย็นๆ นะคะ เราจะรีบส่งผู้ช่วยไปหาคุณโดยเร็วที่สุด
          </div>
        </div>

        <div className="bg-card border-2 border-border rounded-[20px] overflow-hidden">
          <div className="h-[180px] bg-mint relative flex items-center justify-center">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 800 180"
              preserveAspectRatio="none"
            >
              <rect width="800" height="180" fill="#E4F3EA" />
              <path
                d="M0 120 L200 100 L420 140 L620 90 L800 110"
                stroke="#CFE7DC"
                strokeWidth="18"
                fill="none"
              />
              <path
                d="M0 60 L260 70 L500 40 L800 55"
                stroke="#CFE7DC"
                strokeWidth="12"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <div className="w-[22px] h-[22px] rounded-full bg-danger border-4 border-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]" />
              <div className="w-[2px] h-[14px] bg-danger" />
            </div>
          </div>
          <div className="px-5.5 py-4 flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s-7-4.4-7-10a7 7 0 1 1 14 0c0 5.6-7 10-7 10z"
                stroke="#2F7A68"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="12" cy="11" r="2.5" fill="#2F7A68" />
            </svg>
            <div className="text-base font-semibold">
              {locating ? "กำลังค้นหาตำแหน่งของคุณ..." : locationLabel}
            </div>
          </div>
        </div>

        {!pickupAddress && !locating && (
          <div>
            <label className="text-lg font-bold block mb-2.5">
              ที่อยู่ปัจจุบันของคุณ
            </label>
            <input
              type="text"
              placeholder="เช่น บ้านเลขที่ 12 ซอยลาดพร้าว 15"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full box-border text-lg px-4.5 py-4 rounded-2xl border-2 border-border bg-card text-ink"
            />
          </div>
        )}

        <div>
          <div className="text-[19px] font-extrabold mb-3">
            เลือกปลายทาง (ระบบแนะนำสถานที่ใกล้คุณที่สุด)
          </div>
          <div className="flex flex-col gap-3">
            {mockDestinations.map((d) => {
              const selected = selectedDest === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDest(d.id)}
                  className={`border-2 rounded-[18px] px-5.5 py-5 flex items-center gap-4 cursor-pointer text-left ${
                    selected
                      ? "border-danger bg-warm-red"
                      : "border-border bg-card"
                  }`}
                >
                  <span
                    className={`w-[26px] h-[26px] rounded-full border-2 shrink-0 flex items-center justify-center ${
                      selected ? "border-danger" : "border-border"
                    }`}
                  >
                    {selected && (
                      <span className="w-3.5 h-3.5 rounded-full bg-danger" />
                    )}
                  </span>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-ink">{d.name}</div>
                    <div className="text-sm text-sub">{d.meta}</div>
                  </div>
                  <div className="text-[28px]">{d.icon}</div>
                </button>
              );
            })}
            <button
              onClick={() => setSelectedDest("custom")}
              className={`border-2 border-dashed rounded-[18px] px-5.5 py-5 flex items-center gap-4 cursor-pointer text-left ${
                selectedDest === "custom"
                  ? "border-danger bg-warm-red"
                  : "border-border bg-card"
              }`}
            >
              <span
                className={`w-[26px] h-[26px] rounded-full border-2 shrink-0 flex items-center justify-center ${
                  selectedDest === "custom" ? "border-danger" : "border-border"
                }`}
              >
                {selectedDest === "custom" && (
                  <span className="w-3.5 h-3.5 rounded-full bg-danger" />
                )}
              </span>
              <div className="flex-1 text-lg font-bold text-sub">
                พิมพ์ปลายทางอื่น
              </div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="#5B584D"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {selectedDest === "custom" && (
              <input
                type="text"
                autoFocus
                placeholder="เช่น โรงพยาบาลใกล้บ้าน"
                value={customDestination}
                onChange={(e) => setCustomDestination(e.target.value)}
                className="w-full box-border text-lg px-4.5 py-4 rounded-2xl border-2 border-border bg-card text-ink"
              />
            )}
          </div>
        </div>

        {error && (
          <p className="text-danger text-base font-semibold m-0">{error}</p>
        )}

        <button
          onClick={() => setModalOpen(true)}
          className="min-h-[76px] rounded-[20px] bg-danger text-white text-2xl font-extrabold flex items-center justify-center gap-3.5 shadow-[0_6px_0_var(--danger-deep)] cursor-pointer border-none"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 12a8 8 0 1 1-8-8"
              stroke="#fff"
              strokeWidth="2.6"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M20 4l-8 8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
            <path
              d="M13 4h7v7"
              stroke="#fff"
              strokeWidth="2.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          ยืนยัน ขอความช่วยเหลือทันที
        </button>

        <div className="bg-card border-2 border-border rounded-2xl px-4 py-4 md:px-5.5 md:py-4.5 flex flex-col sm:flex-row sm:items-center gap-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0 hidden sm:block"
          >
            <path
              d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
              stroke="#B3261E"
              strokeWidth="1.8"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex-1 text-sm text-sub leading-relaxed">
            บริการนี้คือ <b className="text-ink">ผู้ช่วยเดินทาง</b>{" "}
            ไม่ใช่รถพยาบาลหรือบริการทางการแพทย์ฉุกเฉิน
            <br />
            หากเป็นเหตุฉุกเฉินทางการแพทย์ กรุณาโทรแจ้งหน่วยกู้ชีพโดยตรง
          </div>
          <a
            href="tel:1669"
            className="flex items-center justify-center gap-2 bg-danger text-white font-extrabold text-lg px-5.5 py-3.5 rounded-2xl shrink-0 no-underline w-full sm:w-auto"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.4c.9.4 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"
                fill="#fff"
              />
            </svg>
            โทร 1669
          </a>
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="คุณต้องการขอความช่วยเหลือด่วนใช่ไหมคะ?"
        description="เราจะรีบส่งผู้ช่วยที่อยู่ใกล้คุณที่สุดไปหาคุณทันที"
        confirmLabel="ใช่ ต้องการความช่วยเหลือ"
        cancelLabel="ยกเลิก"
        danger
        loading={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
