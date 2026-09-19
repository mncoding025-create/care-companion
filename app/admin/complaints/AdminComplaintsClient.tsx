"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatBookingDate, serviceTypeLabel } from "@/lib/format";
import type { Database } from "@/types/supabase";

type ServiceType = Database["public"]["Enums"]["service_type"];

export type ComplaintRow = {
  id: string;
  category: string;
  description: string;
  status: "pending" | "investigating" | "resolved";
  isUrgent: boolean;
  createdAt: string;
  reporterName: string;
  reporterPhone: string | null;
  againstId: string | null;
  againstName: string | null;
  againstPhone: string | null;
  bookingServiceType: ServiceType | null;
};

function badgeFor(c: ComplaintRow) {
  if (c.status === "resolved") return { label: "แก้ไขแล้ว", bg: "#F1F1E8", color: "var(--sub)" };
  if (c.isUrgent) return { label: "ด่วน", bg: "var(--warm-red)", color: "var(--danger)" };
  return { label: "รอตรวจสอบ", bg: "#FCEFE6", color: "#B36A3F" };
}

export function AdminComplaintsClient({ complaints }: { complaints: ComplaintRow[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(complaints[0]?.id ?? null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [contactInfo, setContactInfo] = useState("");

  const selected = complaints.find((c) => c.id === selectedId) ?? null;

  async function handleResolve() {
    if (!selected) return;
    setBusy(true);
    const supabase = createClient();
    await supabase
      .from("complaints")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", selected.id);
    setBusy(false);
    setResolveOpen(false);
    router.refresh();
  }

  async function handleSuspend() {
    if (!selected?.againstId) return;
    setBusy(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ is_active: false })
      .eq("id", selected.againstId);
    await supabase
      .from("complaints")
      .update({ status: "investigating" })
      .eq("id", selected.id);
    setBusy(false);
    setSuspendOpen(false);
    router.refresh();
  }

  function showContacts() {
    if (!selected) return;
    setContactInfo(
      `ลูกค้า: ${selected.reporterName} ${selected.reporterPhone ?? "(ไม่มีเบอร์)"} · ผู้ช่วย: ${
        selected.againstName ?? "—"
      } ${selected.againstPhone ?? "(ไม่มีเบอร์)"}`
    );
  }

  return (
    <div className="flex-1 px-14 py-10 flex gap-8">
      <div className="flex-1 max-w-[760px] flex flex-col gap-5">
        <div className="text-[30px] font-extrabold text-ink">ข้อร้องเรียน / ปัญหา</div>

        {complaints.map((c) => {
          const badge = badgeFor(c);
          const selectedNow = c.id === selectedId;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="bg-card border border-border rounded-[18px] p-6 flex flex-col gap-2.5 cursor-pointer text-left"
              style={{
                borderLeft: c.isUrgent && c.status !== "resolved"
                  ? "6px solid var(--danger)"
                  : selectedNow
                  ? "6px solid var(--primary)"
                  : undefined,
              }}
            >
              <div className="flex justify-between">
                <span className="text-lg font-extrabold text-ink">{c.category}</span>
                <span
                  className="text-[13px] font-bold px-3 py-1.5 rounded-full"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
              </div>
              <div className="text-sm text-sub">
                จาก: {c.reporterName}
                {c.againstName ? ` · เกี่ยวกับ: ${c.againstName}` : ""} ·{" "}
                {formatBookingDate(c.createdAt.slice(0, 10))}
              </div>
            </button>
          );
        })}

        {complaints.length === 0 && (
          <div className="bg-card border border-border rounded-[18px] px-8 py-10 text-center text-lg text-sub">
            ยังไม่มีข้อร้องเรียน
          </div>
        )}
      </div>

      <div className="w-[440px]">
        {selected ? (
          <div className="bg-card border border-border rounded-[18px] p-8 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <span className="text-xl font-extrabold">รายละเอียดข้อร้องเรียน</span>
              {(() => {
                const badge = badgeFor(selected);
                return (
                  <span
                    className="text-[13px] font-bold px-3 py-1.5 rounded-full"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {badge.label}
                  </span>
                );
              })()}
            </div>
            <div className="text-base leading-loose text-sub">
              <b className="text-ink">ลูกค้า:</b> {selected.reporterName}
              <br />
              <b className="text-ink">ผู้ช่วย:</b> {selected.againstName ?? "—"}
              <br />
              <b className="text-ink">ประเภทงาน:</b>{" "}
              {selected.bookingServiceType ? serviceTypeLabel(selected.bookingServiceType) : "—"}
              <br />
              <b className="text-ink">วันที่แจ้ง:</b> {formatBookingDate(selected.createdAt.slice(0, 10))}
            </div>
            <div className="bg-bg-cream rounded-2xl p-4.5 text-base leading-relaxed">
              &ldquo;{selected.description}&rdquo;
            </div>

            {contactInfo && (
              <div className="text-sm text-sub bg-sky rounded-xl p-3.5">{contactInfo}</div>
            )}

            <div className="flex flex-col gap-3 mt-1">
              <button
                onClick={showContacts}
                className="min-h-[52px] rounded-[10px] bg-primary text-white text-sm font-bold border-none cursor-pointer"
              >
                ติดต่อทั้งสองฝ่าย
              </button>
              {selected.status !== "resolved" && (
                <button
                  onClick={() => setResolveOpen(true)}
                  className="min-h-[52px] rounded-[10px] bg-card border-2 border-border text-sm font-bold cursor-pointer"
                >
                  บันทึกว่าแก้ไขแล้ว
                </button>
              )}
              {selected.againstId && (
                <button
                  onClick={() => setSuspendOpen(true)}
                  className="min-h-[52px] rounded-[10px] bg-card border-2 text-danger text-sm font-bold cursor-pointer"
                  style={{ borderColor: "#F3D5CE" }}
                >
                  ระงับผู้ช่วยชั่วคราว
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-[18px] p-8 text-center text-sub">
            เลือกข้อร้องเรียนเพื่อดูรายละเอียด
          </div>
        )}
      </div>

      <ConfirmModal
        open={resolveOpen}
        title="บันทึกว่าแก้ไขแล้วใช่ไหม?"
        description="เปลี่ยนสถานะข้อร้องเรียนนี้เป็นแก้ไขแล้ว"
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        loading={busy}
        onConfirm={handleResolve}
        onCancel={() => setResolveOpen(false)}
      />

      <ConfirmModal
        open={suspendOpen}
        title="ระงับผู้ช่วยคนนี้ชั่วคราวใช่ไหม?"
        description={`ระงับบัญชีของ${selected?.againstName ?? ""}จนกว่าจะตรวจสอบเสร็จ`}
        confirmLabel="ระงับบัญชี"
        cancelLabel="ยกเลิก"
        danger
        loading={busy}
        onConfirm={handleSuspend}
        onCancel={() => setSuspendOpen(false)}
      />
    </div>
  );
}
