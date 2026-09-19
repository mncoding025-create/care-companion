"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { initials } from "@/lib/format";

export type AdminUserRow = {
  id: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  role: "customer" | "companion";
  isVerified: boolean;
  usageCount: number;
};

type Tab = "customer" | "companion" | "pending";

export function AdminUsersClient({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("customer");
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<AdminUserRow | null>(null);
  const [busy, setBusy] = useState(false);

  const customers = users.filter((u) => u.role === "customer");
  const companions = users.filter((u) => u.role === "companion");
  const pending = companions.filter((u) => !u.isVerified);

  const list = tab === "customer" ? customers : tab === "companion" ? companions : pending;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) => u.fullName.toLowerCase().includes(q) || (u.phone ?? "").includes(q)
    );
  }, [list, query]);

  async function toggleActive() {
    if (!target) return;
    setBusy(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ is_active: !target.isActive })
      .eq("id", target.id);
    setBusy(false);
    setTarget(null);
    router.refresh();
  }

  return (
    <div className="flex-1 px-14 py-10 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="text-[30px] font-extrabold text-ink">จัดการผู้ใช้งาน</div>
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อ หรือ เบอร์โทร"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-[320px] text-base px-4 py-3 rounded-xl border-2 border-border"
        />
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={() => setTab("customer")}
          className={`text-base font-bold px-5 py-3 rounded-xl cursor-pointer border-none ${
            tab === "customer" ? "bg-primary text-white" : "bg-transparent text-sub"
          }`}
        >
          ลูกค้า ({customers.length})
        </button>
        <button
          onClick={() => setTab("companion")}
          className={`text-base font-bold px-5 py-3 rounded-xl cursor-pointer border-none ${
            tab === "companion" ? "bg-primary text-white" : "bg-transparent text-sub"
          }`}
        >
          ผู้ช่วยเดินทาง ({companions.length})
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`text-base font-bold px-5 py-3 rounded-xl cursor-pointer border-none ${
            tab === "pending" ? "bg-primary text-white" : "bg-transparent text-sub"
          }`}
        >
          รออนุมัติ ({pending.length})
        </button>
      </div>

      <div className="bg-card border border-border rounded-[18px] overflow-hidden">
        <div className="flex px-7 py-4 bg-bg-cream text-[15px] font-bold text-sub">
          <div className="w-[260px]">ชื่อ</div>
          <div className="w-[180px]">เบอร์โทร</div>
          <div className="w-[140px]">จำนวนครั้งที่ใช้</div>
          <div className="w-[140px]">สถานะ</div>
          <div className="flex-1">จัดการ</div>
        </div>

        {filtered.map((u) => (
          <div
            key={u.id}
            className="flex items-center px-7 py-4.5 border-t border-border text-base"
          >
            <div className="w-[260px] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center font-bold text-primary-dark">
                {initials(u.fullName)}
              </div>
              คุณ{u.fullName}
            </div>
            <div className="w-[180px] text-sub">{u.phone ?? "—"}</div>
            <div className="w-[140px]">{u.usageCount} ครั้ง</div>
            <div className="w-[140px]">
              <span
                className={`text-[13px] font-bold px-3 py-1.5 rounded-full ${
                  u.isActive
                    ? "bg-mint text-primary-dark"
                    : "bg-warm-red text-danger"
                }`}
              >
                {u.isActive ? "ใช้งานอยู่" : "ถูกระงับ"}
              </span>
            </div>
            <div className="flex-1 flex gap-2">
              <button
                onClick={() => setTarget(u)}
                className={`text-sm font-bold px-4 py-2 rounded-[10px] border-2 bg-card cursor-pointer ${
                  u.isActive
                    ? "text-danger"
                    : "text-primary border-mint"
                }`}
                style={u.isActive ? { borderColor: "#F3D5CE" } : undefined}
              >
                {u.isActive ? "ระงับ" : "ยกเลิกระงับ"}
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-10 text-center text-sub">ไม่พบผู้ใช้งาน</div>
        )}
      </div>

      <ConfirmModal
        open={!!target}
        title={
          target?.isActive
            ? "ระงับบัญชีผู้ใช้นี้ใช่ไหม?"
            : "ยกเลิกการระงับบัญชีนี้ใช่ไหม?"
        }
        description={`${target?.isActive ? "ระงับ" : "ยกเลิกระงับ"}บัญชีของคุณ${target?.fullName}`}
        confirmLabel={target?.isActive ? "ระงับบัญชี" : "ยกเลิกระงับ"}
        cancelLabel="ยกเลิก"
        danger={target?.isActive}
        loading={busy}
        onConfirm={toggleActive}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
