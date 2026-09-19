"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/format";

const dayOptions = [
  { value: "mon", label: "จ" },
  { value: "tue", label: "อ" },
  { value: "wed", label: "พ" },
  { value: "thu", label: "พฤ" },
  { value: "fri", label: "ศ" },
  { value: "sat", label: "ส" },
  { value: "sun", label: "อา" },
];

export function CompanionProfileClient({
  profileId,
  fullName,
  ratingAvg,
  totalJobs,
  isVerified,
  initialExperience,
  initialServiceAreas,
  initialAvailableDays,
  initialStartTime,
  initialEndTime,
}: {
  profileId: string;
  fullName: string;
  ratingAvg: number;
  totalJobs: number;
  isVerified: boolean;
  initialExperience: string;
  initialServiceAreas: string[];
  initialAvailableDays: string[];
  initialStartTime: string;
  initialEndTime: string;
}) {
  const router = useRouter();
  const [experience, setExperience] = useState(initialExperience);
  const [serviceAreas, setServiceAreas] = useState(initialServiceAreas);
  const [newArea, setNewArea] = useState("");
  const [addingArea, setAddingArea] = useState(false);
  const [availableDays, setAvailableDays] = useState(initialAvailableDays);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleDay(value: string) {
    setAvailableDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  }

  function addArea() {
    const trimmed = newArea.trim();
    if (trimmed && !serviceAreas.includes(trimmed)) {
      setServiceAreas((prev) => [...prev, trimmed]);
    }
    setNewArea("");
    setAddingArea(false);
  }

  function removeArea(area: string) {
    setServiceAreas((prev) => prev.filter((a) => a !== area));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    await supabase
      .from("companion_details")
      .update({
        experience_text: experience || null,
        service_areas: serviceAreas,
        available_days: availableDays,
        available_start_time: startTime || null,
        available_end_time: endTime || null,
      })
      .eq("profile_id", profileId);
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex-1 px-5 py-6 md:px-14 md:py-10 flex flex-col gap-6 max-w-[900px] pb-24 md:pb-10">
      <div className="text-[26px] md:text-[30px] font-extrabold text-ink">โปรไฟล์ของฉัน</div>

      <div className="bg-card border border-border rounded-[20px] p-5 md:p-8 flex flex-wrap gap-5 md:gap-6 items-center">
        <div className="w-24 h-24 rounded-full bg-mint flex items-center justify-center text-[34px] font-extrabold text-primary-dark shrink-0">
          {initials(fullName)}
        </div>
        <div className="flex-1">
          <div className="text-[22px] font-extrabold text-ink">คุณ{fullName}</div>
          <div className="text-base text-sub mt-1">
            ⭐ {ratingAvg.toFixed(1)} · รับงานแล้ว {totalJobs} ครั้ง
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-2 font-bold text-sm px-3.5 py-2 rounded-full ${
            isVerified
              ? "bg-mint text-primary-dark"
              : "bg-bg-cream border-2 border-border text-sub"
          }`}
        >
          {isVerified ? "✓ ยืนยันตัวตนแล้ว" : "รอการตรวจสอบ"}
        </span>
      </div>

      <div className="bg-card border border-border rounded-[20px] p-5 md:p-8 flex flex-col gap-6">
        <div className="text-xl font-extrabold text-ink">ข้อมูลทั่วไป</div>
        <div>
          <label className="text-[17px] font-bold block mb-2">
            ประสบการณ์ / ความสามารถพิเศษ
          </label>
          <textarea
            rows={3}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full box-border text-[17px] px-4 py-3.5 rounded-2xl border-2 border-border"
          />
        </div>
        <div>
          <label className="text-[17px] font-bold block mb-2">
            พื้นที่ให้บริการ
          </label>
          <div className="flex gap-2.5 flex-wrap items-center">
            {serviceAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-2 bg-mint text-primary-dark font-bold text-sm px-3.5 py-2 rounded-full"
              >
                {area}
                <button
                  onClick={() => removeArea(area)}
                  className="bg-transparent border-none cursor-pointer text-primary-dark font-bold"
                  aria-label={`ลบพื้นที่ ${area}`}
                >
                  ✕
                </button>
              </span>
            ))}
            {addingArea ? (
              <input
                autoFocus
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addArea()}
                onBlur={addArea}
                placeholder="ชื่อพื้นที่"
                className="text-sm px-3.5 py-2 rounded-full border-2 border-border w-[140px]"
              />
            ) : (
              <button
                onClick={() => setAddingArea(true)}
                className="inline-flex items-center gap-2 bg-card border-2 border-dashed border-border text-sub font-bold text-sm px-3.5 py-2 rounded-full cursor-pointer"
              >
                + เพิ่มพื้นที่
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[20px] p-5 md:p-8 flex flex-col gap-5">
        <div className="text-xl font-extrabold text-ink">
          ช่วงเวลาที่ว่างรับงาน
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {dayOptions.map((d) => {
            const on = availableDays.includes(d.value);
            return (
              <button
                key={d.value}
                onClick={() => toggleDay(d.value)}
                className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center text-base font-bold border-2 cursor-pointer ${
                  on
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-ink border-border"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-[17px] font-bold block mb-2">
              เวลาเริ่ม
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full box-border text-[17px] px-4 py-3.5 rounded-2xl border-2 border-border"
            />
          </div>
          <div className="flex-1">
            <label className="text-[17px] font-bold block mb-2">
              เวลาสิ้นสุด
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full box-border text-[17px] px-4 py-3.5 rounded-2xl border-2 border-border"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 self-end">
        {saved && (
          <span className="text-primary-dark font-semibold text-base">
            บันทึกแล้ว ✓
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2.5 min-h-[56px] rounded-2xl bg-primary text-white text-lg font-bold border-none shadow-[0_4px_0_var(--primary-dark)] cursor-pointer px-7 disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </button>
      </div>
    </div>
  );
}
