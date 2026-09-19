"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const HOLD_MS = 1200;

export function EmergencyFAB() {
  const pathname = usePathname();
  const router = useRouter();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (pathname.startsWith("/emergency")) return null;

  function startHold() {
    if (timerRef.current) return;
    const started = Date.now();
    setHolding(true);
    setProgress(0);
    timerRef.current = setInterval(() => {
      const pct = Math.min(1, (Date.now() - started) / HOLD_MS);
      setProgress(pct);
      if (pct >= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        router.push("/emergency");
      }
    }, 40);
  }

  function cancelHold() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setHolding(false);
    setProgress(0);
  }

  const holdDeg = Math.round(progress * 360);
  const holdLabel = (HOLD_MS / 1000 - progress * (HOLD_MS / 1000)).toFixed(1);

  return (
    <div className="fixed right-4 md:right-8 bottom-20 md:bottom-8 z-50 flex flex-col items-center gap-2">
      {holding && (
        <div className="bg-white text-danger text-sm font-bold px-3.5 py-2 rounded-xl shadow-lg whitespace-nowrap">
          กดค้างไว้อีก {holdLabel} วิ...
        </div>
      )}
      <div
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        className="w-[88px] h-[88px] rounded-full flex items-center justify-center cursor-pointer shadow-[0_10px_24px_rgba(179,38,30,0.38)]"
        style={{
          background: `conic-gradient(#7A1F17 ${holdDeg}deg, #EFA69B ${holdDeg}deg)`,
        }}
      >
        <div className="w-[74px] h-[74px] rounded-full bg-[#E5433A] flex flex-col items-center justify-center gap-0.5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l1.6 4.8L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.2L12 2z"
              fill="#fff"
            />
            <path
              d="M4 21c1-4 4-7 8-7s7 3 8 7"
              stroke="#fff"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-white text-xs font-extrabold">ช่วยด่วน</span>
        </div>
      </div>
    </div>
  );
}
