"use client";

import { ReactNode } from "react";
import { Button } from "./Button";

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card rounded-3xl p-8 max-w-[440px] w-full flex flex-col gap-6 shadow-xl">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-extrabold text-ink m-0">{title}</h2>
          <p className="text-lg text-sub m-0 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            size="lg"
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "กำลังดำเนินการ..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
