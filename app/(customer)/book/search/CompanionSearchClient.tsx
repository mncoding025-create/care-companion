"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/format";
import type { Database } from "@/types/supabase";

type ServiceType = Database["public"]["Enums"]["service_type"];

export type CompanionOption = {
  profileId: string;
  fullName: string;
  experienceText: string | null;
  serviceAreas: string[];
  ratingAvg: number;
  ratingCount: number;
};

export function CompanionSearchClient({
  companions,
  draft,
}: {
  companions: CompanionOption[];
  draft: {
    service: ServiceType;
    date: string;
    time: string;
    pickup: string;
    destination: string;
    details: string;
  };
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    companions[0]?.profileId ?? null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!selectedId) return;
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        companion_id: selectedId,
        service_type: draft.service,
        scheduled_date: draft.date || null,
        scheduled_time: draft.time || null,
        pickup_address: draft.pickup,
        destination_address: draft.destination,
        details: draft.details || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !data) {
      setError("จองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setSubmitting(false);
      return;
    }

    router.push(`/booking/${data.id}`);
  }

  return (
    <div className="flex justify-center px-4 py-8 md:px-6 md:py-12">
      <div className="w-full max-w-[900px] flex flex-col gap-6">
        <Link
          href="/book"
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
          กลับ
        </Link>

        <div>
          <div className="text-[30px] font-extrabold text-ink">
            เลือกผู้ช่วยเดินทาง
          </div>
          <div className="text-[17px] text-sub mt-1.5">
            ขั้นตอนที่ 2 จาก 3 — มีผู้ช่วย {companions.length} คนว่างในช่วงเวลาที่คุณเลือก
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 h-2 rounded-full bg-primary" />
          <div className="flex-1 h-2 rounded-full bg-primary" />
          <div className="flex-1 h-2 rounded-full bg-border" />
        </div>

        {companions.length === 0 && (
          <div className="bg-card border-2 border-border rounded-[20px] p-9 text-center text-lg text-sub">
            ยังไม่มีผู้ช่วยว่างในตอนนี้ กรุณาลองใหม่อีกครั้งภายหลัง
          </div>
        )}

        {companions.map((c) => {
          const selected = c.profileId === selectedId;
          return (
            <div
              key={c.profileId}
              className={`bg-card rounded-[20px] p-5 md:p-7 flex flex-col sm:flex-row gap-4 md:gap-6 sm:items-center border-2 ${
                selected
                  ? "border-primary shadow-[0_0_0_4px_var(--mint)]"
                  : "border-border"
              }`}
            >
              <div
                className={`w-[84px] h-[84px] rounded-full flex items-center justify-center text-[30px] font-extrabold text-primary-dark shrink-0 ${
                  selected ? "bg-mint" : "bg-sky"
                }`}
              >
                {initials(c.fullName)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="text-[22px] font-extrabold text-ink">
                    {c.fullName}
                  </div>
                  <span className="text-sm font-bold bg-mint text-primary-dark px-3.5 py-1.5 rounded-full">
                    ⭐ {c.ratingAvg.toFixed(1)} ({c.ratingCount} รีวิว)
                  </span>
                </div>
                {c.experienceText && (
                  <div className="text-base text-sub mt-1.5">
                    {c.experienceText}
                  </div>
                )}
                {c.serviceAreas.length > 0 && (
                  <div className="text-[15px] text-sub mt-1">
                    📍 ให้บริการในพื้นที่{c.serviceAreas.join(", ")}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedId(c.profileId)}
                className={`min-h-[52px] rounded-2xl text-[17px] font-bold border-none cursor-pointer px-6 w-full sm:w-auto ${
                  selected
                    ? "bg-primary text-white"
                    : "bg-card text-primary border-2 border-primary"
                }`}
              >
                เลือกคนนี้
              </button>
            </div>
          );
        })}

        {error && (
          <p className="text-danger text-base font-semibold text-right m-0">
            {error}
          </p>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selectedId || submitting}
          className="self-end flex items-center justify-center gap-2.5 min-h-[60px] rounded-2xl bg-primary text-white text-xl font-bold border-none shadow-[0_4px_0_var(--primary-dark)] cursor-pointer px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "กำลังยืนยัน..." : "ยืนยันการจอง"}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="#fff"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
