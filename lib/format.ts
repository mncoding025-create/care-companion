import type { Database } from "@/types/supabase";

type ServiceType = Database["public"]["Enums"]["service_type"];

const serviceTypeLabels: Record<ServiceType, string> = {
  hospital: "พาไปหาหมอ",
  shopping: "ไปจ่ายตลาด/ซื้อของ",
  bank_government: "ไปธนาคาร/ราชการ",
  general: "เดินทางทั่วไป",
};

const serviceTypeIcons: Record<ServiceType, string> = {
  hospital: "🏥",
  shopping: "🛒",
  bank_government: "🏦",
  general: "🚗",
};

export function serviceTypeLabel(type: ServiceType): string {
  return serviceTypeLabels[type];
}

export function serviceTypeIcon(type: ServiceType): string {
  return serviceTypeIcons[type];
}

export function formatBookingDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (target.getTime() === today.getTime()) return "วันนี้";
  if (target.getTime() === tomorrow.getTime()) return "พรุ่งนี้";

  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(target);
}

export function formatBookingTime(timeStr: string | null): string {
  if (!timeStr) return "";
  return `${timeStr.slice(0, 5)} น.`;
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function initials(fullName: string): string {
  return fullName.trim().slice(0, 2) || "??";
}
