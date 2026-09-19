"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/format";

export function ProfileInfoClient({
  userId,
  fullName: initialFullName,
  phone: initialPhone,
  address: initialAddress,
  completedCount,
}: {
  userId: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  completedCount: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [address, setAddress] = useState(initialAddress ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        address: address || null,
      })
      .eq("id", userId);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="bg-card border border-border rounded-[20px] p-5 md:p-8 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-base font-bold block mb-2">ชื่อ-นามสกุล</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full box-border text-[17px] px-4 py-3.5 rounded-2xl border-2 border-border"
            />
          </div>
          <div className="flex-1">
            <label className="text-base font-bold block mb-2">เบอร์โทร</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full box-border text-[17px] px-4 py-3.5 rounded-2xl border-2 border-border"
            />
          </div>
        </div>
        <div>
          <label className="text-base font-bold block mb-2">
            ที่อยู่ (ใช้เป็นจุดรับเริ่มต้นเวลาจอง)
          </label>
          <input
            type="text"
            placeholder="เช่น บ้านเลขที่ 12 ซอยลาดพร้าว 15"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full box-border text-[17px] px-4 py-3.5 rounded-2xl border-2 border-border"
          />
        </div>
        <div className="flex gap-3 self-end">
          <button
            onClick={() => setEditing(false)}
            className="min-h-[56px] rounded-2xl bg-card border-2 border-border text-ink text-lg font-bold cursor-pointer px-6"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="min-h-[56px] rounded-2xl bg-primary text-white text-lg font-bold border-none shadow-[0_4px_0_var(--primary-dark)] cursor-pointer px-7 disabled:opacity-50"
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-[20px] p-5 md:p-8 flex flex-wrap gap-5 md:gap-6 items-center">
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-mint flex items-center justify-center text-[28px] md:text-[34px] font-extrabold text-primary-dark shrink-0">
        {initials(fullName)}
      </div>
      <div className="flex-1 min-w-[180px]">
        <div className="text-xl md:text-[22px] font-extrabold text-ink">คุณ{fullName}</div>
        <div className="text-base text-sub mt-1">
          {phone ? `${phone} · ` : ""}ใช้บริการมาแล้ว {completedCount} ครั้ง
        </div>
        {address && (
          <div className="text-sm text-sub mt-1">📍 {address}</div>
        )}
      </div>
      <button
        onClick={() => setEditing(true)}
        className="bg-card border-2 border-border rounded-xl px-4.5 py-2.5 text-sm font-bold cursor-pointer"
      >
        แก้ไข
      </button>
    </div>
  );
}
