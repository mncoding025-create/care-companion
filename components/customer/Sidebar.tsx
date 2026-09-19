"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/format";

const navItems = [
  { key: "dashboard", href: "/dashboard", icon: "🏠", label: "หน้าแรก" },
  { key: "book", href: "/book", icon: "📝", label: "ขอผู้ช่วยใหม่" },
  { key: "tracking", href: "/booking", icon: "📍", label: "ติดตามสถานะ" },
  { key: "history", href: "/history", icon: "🕘", label: "ประวัติการใช้บริการ" },
  { key: "profile", href: "/profile", icon: "👤", label: "โปรไฟล์ของฉัน" },
] as const;

type NavKey = (typeof navItems)[number]["key"];

export function Sidebar({
  active,
  fullName,
}: {
  active: NavKey;
  fullName: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-[260px] bg-card border-r border-border px-5 py-8 flex flex-col gap-2 shrink-0">
      <div className="flex items-center gap-2.5 px-2 pb-7">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21s-7.5-4.6-10-9.3C.5 8 2.2 4.5 5.6 4c2-.3 3.8.6 5 2 1.2-1.4 3-2.3 5-2 3.4.5 5.1 4 3.6 7.7C19.5 16.4 12 21 12 21z"
            fill="#E38B6B"
          />
        </svg>
        <span className="text-xl font-extrabold text-primary-dark">
          Care Companion
        </span>
      </div>

      {navItems.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`flex items-center gap-3 text-[17px] font-semibold rounded-xl px-4 py-2.5 no-underline ${
            active === item.key ? "text-primary-dark bg-mint" : "text-sub"
          }`}
        >
          <span>{item.icon}</span>
          {item.label}
        </Link>
      ))}

      <div className="flex-1" />

      {active === "profile" ? (
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-2 py-4 border-t border-border text-left bg-transparent border-x-0 border-b-0 cursor-pointer"
        >
          <span className="w-11 h-11 rounded-full bg-mint flex items-center justify-center text-lg font-bold text-primary-dark shrink-0">
            {initials(fullName)}
          </span>
          <span>
            <span className="block text-base font-bold text-ink">
              คุณ{fullName}
            </span>
            <span className="block text-sm text-sub">ออกจากระบบ</span>
          </span>
        </button>
      ) : (
        <Link
          href="/profile"
          className="flex items-center gap-3 px-2 py-4 border-t border-border no-underline text-inherit"
        >
          <span className="w-11 h-11 rounded-full bg-mint flex items-center justify-center text-lg font-bold text-primary-dark shrink-0">
            {initials(fullName)}
          </span>
          <span>
            <span className="block text-base font-bold text-ink">
              คุณ{fullName}
            </span>
            <span className="block text-sm text-sub">ดูโปรไฟล์</span>
          </span>
        </Link>
      )}
    </div>
  );
}
