"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { key: "dashboard", href: "/admin/dashboard", icon: "📊", label: "ภาพรวมระบบ" },
  { key: "users", href: "/admin/users", icon: "👥", label: "จัดการผู้ใช้งาน" },
  { key: "complaints", href: "/admin/complaints", icon: "⚠️", label: "ข้อร้องเรียน" },
] as const;

type NavKey = (typeof navItems)[number]["key"];

export function Sidebar({ active }: { active: NavKey }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-[250px] bg-primary-dark px-[18px] py-7 flex flex-col gap-1.5 shrink-0">
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21s-7.5-4.6-10-9.3C.5 8 2.2 4.5 5.6 4c2-.3 3.8.6 5 2 1.2-1.4 3-2.3 5-2 3.4.5 5.1 4 3.6 7.7C19.5 16.4 12 21 12 21z"
            fill="#E38B6B"
          />
        </svg>
        <span className="text-lg font-extrabold text-white">Care Companion</span>
      </div>
      <div className="text-[13px] font-bold text-[#a9c9bf] px-4 pb-2">ADMIN</div>

      {navItems.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`flex items-center gap-3 text-base font-semibold rounded-xl px-4 py-3 no-underline ${
            active === item.key
              ? "text-white bg-white/10"
              : "text-[#cfe6de]"
          }`}
        >
          <span>{item.icon}</span>
          {item.label}
        </Link>
      ))}

      <div className="flex-1" />

      <button
        onClick={handleLogout}
        className="text-left text-sm font-bold text-[#cfe6de] bg-transparent border-0 border-t border-white/15 pt-4 px-4 cursor-pointer"
      >
        ออกจากระบบ
      </button>
    </div>
  );
}
