"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { key: "jobs", href: "/jobs", icon: "📋", label: "งานที่เข้ามา" },
  { key: "current", href: "/jobs", icon: "🚗", label: "งานปัจจุบัน" },
  { key: "profile", href: "/companion/profile", icon: "👤", label: "โปรไฟล์ของฉัน" },
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
    <>
      <div className="hidden md:flex w-[260px] bg-card border-r border-border px-5 py-8 flex-col gap-2 shrink-0">
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

        <button
          onClick={handleLogout}
          className="text-left text-[15px] font-bold text-sub bg-transparent border-0 border-t border-border pt-4 px-2 cursor-pointer"
        >
          ออกจากระบบ
        </button>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-bold no-underline ${
              active === item.key ? "text-primary-dark" : "text-sub"
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-bold text-sub bg-transparent border-none cursor-pointer"
        >
          <span className="text-xl leading-none">🚪</span>
          ออกจากระบบ
        </button>
      </nav>
    </>
  );
}
