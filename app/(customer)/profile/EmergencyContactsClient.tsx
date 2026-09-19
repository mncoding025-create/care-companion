"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { initials } from "@/lib/format";
import type { Database } from "@/types/supabase";

type EmergencyContact = Database["public"]["Tables"]["emergency_contacts"]["Row"];

export function EmergencyContactsClient({
  customerId,
  initialContacts,
}: {
  customerId: string;
  initialContacts: EmergencyContact[];
}) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<EmergencyContact | null>(null);
  const [deleting, setDeleting] = useState(false);

  function startEdit(contact: EmergencyContact) {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship ?? "");
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPhone("");
    setRelationship("");
  }

  async function handleSave() {
    if (!name.trim() || !phone.trim()) {
      setError("กรุณากรอกชื่อและเบอร์โทรให้ครบ");
      return;
    }
    setError("");
    setSaving(true);
    const supabase = createClient();

    if (editingId) {
      const { data, error: updateError } = await supabase
        .from("emergency_contacts")
        .update({ name, phone, relationship: relationship || null })
        .eq("id", editingId)
        .select()
        .single();
      if (!updateError && data) {
        setContacts((prev) =>
          prev.map((c) => (c.id === editingId ? data : c))
        );
        resetForm();
      } else {
        setError("บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("emergency_contacts")
        .insert({
          customer_id: customerId,
          name,
          phone,
          relationship: relationship || null,
        })
        .select()
        .single();
      if (!insertError && data) {
        setContacts((prev) => [...prev, data]);
        resetForm();
      } else {
        setError("บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    }
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("emergency_contacts")
      .delete()
      .eq("id", deleteTarget.id);
    if (!deleteError) {
      setContacts((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      if (editingId === deleteTarget.id) resetForm();
    }
    setDeleting(false);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <>
      <div className="bg-card border-2 border-warm-red rounded-[20px] p-5 md:p-8 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-warm-red flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
                stroke="#B3261E"
                strokeWidth="2"
                fill="none"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="text-xl font-extrabold text-ink">ผู้ติดต่อฉุกเฉิน</div>
            <div className="text-sm text-sub">
              เราจะแจ้งเตือนผู้ติดต่อเหล่านี้เมื่อคุณกดขอความช่วยเหลือด่วน
            </div>
          </div>
        </div>

        {contacts.map((c) => (
          <div
            key={c.id}
            className="border-2 border-border rounded-2xl px-4 py-4 md:px-5 md:py-5 flex flex-wrap items-center gap-3 md:gap-4.5"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-sky shrink-0 flex items-center justify-center text-lg font-extrabold text-primary-dark">
              {initials(c.name)}
            </div>
            <div className="flex-1 min-w-[140px]">
              <div className="text-lg font-bold text-ink">{c.name}</div>
              <div className="text-sm text-sub">
                {c.relationship ? `${c.relationship} · ` : ""}
                {c.phone}
              </div>
            </div>
            <button
              onClick={() => startEdit(c)}
              className="bg-card border-2 border-border rounded-xl px-4.5 py-2.5 text-sm font-bold cursor-pointer"
            >
              แก้ไข
            </button>
            <button
              onClick={() => setDeleteTarget(c)}
              className="bg-card border-2 border-warm-red text-danger rounded-xl px-4.5 py-2.5 text-sm font-bold cursor-pointer"
            >
              ลบ
            </button>
          </div>
        ))}

        {contacts.length === 0 && (
          <p className="text-base text-sub m-0">ยังไม่มีผู้ติดต่อฉุกเฉิน</p>
        )}
      </div>

      <div className="bg-card border border-border rounded-[20px] p-5 md:p-8 flex flex-col gap-5">
        <div className="text-xl font-extrabold text-ink">
          {editingId ? "แก้ไขผู้ติดต่อฉุกเฉิน" : "เพิ่มผู้ติดต่อฉุกเฉิน"}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-base font-bold block mb-2">
              ชื่อ-นามสกุล
            </label>
            <input
              type="text"
              placeholder="เช่น คุณนลิน ใจดี"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full box-border text-[17px] px-4 py-3.5 rounded-2xl border-2 border-border"
            />
          </div>
          <div className="flex-1">
            <label className="text-base font-bold block mb-2">
              เบอร์โทร
            </label>
            <input
              type="text"
              placeholder="08x-xxx-xxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full box-border text-[17px] px-4 py-3.5 rounded-2xl border-2 border-border"
            />
          </div>
          <div className="flex-1">
            <label className="text-base font-bold block mb-2">
              ความสัมพันธ์
            </label>
            <input
              type="text"
              placeholder="เช่น ลูก, หลาน, ญาติ"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full box-border text-[17px] px-4 py-3.5 rounded-2xl border-2 border-border"
            />
          </div>
        </div>
        {error && (
          <p className="text-danger text-base font-semibold m-0">{error}</p>
        )}
        <div className="flex gap-3 self-end">
          {editingId && (
            <button
              onClick={resetForm}
              className="min-h-[56px] rounded-2xl bg-card border-2 border-border text-ink text-lg font-bold cursor-pointer px-6"
            >
              ยกเลิก
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="min-h-[56px] flex items-center justify-center rounded-2xl bg-primary text-white text-lg font-bold border-none shadow-[0_4px_0_var(--primary-dark)] cursor-pointer px-7 disabled:opacity-50"
          >
            {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "บันทึกผู้ติดต่อ"}
          </button>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="ลบผู้ติดต่อฉุกเฉินนี้ใช่ไหมคะ?"
        description={`ลบ "${deleteTarget?.name}" ออกจากรายชื่อผู้ติดต่อฉุกเฉินของคุณ`}
        confirmLabel="ลบผู้ติดต่อ"
        cancelLabel="ไม่ลบ"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
