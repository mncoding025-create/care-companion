"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export function LoginCard({ role }: { role: "customer" | "companion" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(false);
    // signInWithOAuth has no `data` option to stamp user_metadata, so the
    // chosen role rides along in a short-lived cookie the callback route reads.
    document.cookie = `pending_role=${role}; path=/; max-age=600; samesite=lax`;
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-10 flex flex-col gap-6 w-full max-w-[440px] shadow-sm">
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-ink m-0">
          {role === "companion" ? "สมัครเป็นผู้ช่วยเดินทาง" : "เข้าสู่ระบบ"}
        </h1>
        <p className="text-base text-sub m-0">
          {role === "companion"
            ? "เข้าสู่ระบบด้วย Google เพื่อเริ่มสมัครเป็นผู้ช่วยเดินทาง"
            : "เข้าสู่ระบบด้วยบัญชี Google เพื่อใช้งาน Care Companion"}
        </p>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="min-h-[56px] flex items-center justify-center gap-3 rounded-2xl border-2 border-border bg-card font-bold text-lg cursor-pointer disabled:opacity-60"
      >
        <GoogleIcon />
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Google"}
      </button>

      {error && (
        <p className="text-danger text-base text-center m-0">
          เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
        </p>
      )}

      <Link
        href="/"
        className="text-center text-base font-semibold text-primary no-underline"
      >
        ← กลับหน้าแรก
      </Link>
    </div>
  );
}
