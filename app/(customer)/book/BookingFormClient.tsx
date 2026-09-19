"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Database } from "@/types/supabase";
import { serviceTypeIcon, serviceTypeLabel } from "@/lib/format";

type ServiceType = Database["public"]["Enums"]["service_type"];

const serviceOptions: ServiceType[] = [
  "hospital",
  "shopping",
  "bank_government",
  "general",
];

export function BookingFormClient({
  defaultPickupAddress,
}: {
  defaultPickupAddress: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service") as ServiceType | null;

  const [serviceType, setServiceType] = useState<ServiceType>(
    initialService && serviceOptions.includes(initialService)
      ? initialService
      : "hospital"
  );
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [pickupAddress, setPickupAddress] = useState(defaultPickupAddress);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");

  function handleNext() {
    if (!scheduledDate || !scheduledTime || !pickupAddress || !destinationAddress) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่องก่อนไปขั้นตอนถัดไป");
      return;
    }
    const params = new URLSearchParams({
      service: serviceType,
      date: scheduledDate,
      time: scheduledTime,
      pickup: pickupAddress,
      destination: destinationAddress,
      details,
    });
    router.push(`/book/search?${params.toString()}`);
  }

  return (
    <div className="flex justify-center px-6 py-12">
      <div className="w-full max-w-[760px] flex flex-col gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[17px] font-bold text-sub no-underline w-fit"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="#5B584D"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          กลับหน้าแรก
        </Link>

        <div>
          <div className="text-[30px] font-extrabold text-ink">
            ขอผู้ช่วยเดินทาง
          </div>
          <div className="text-[17px] text-sub mt-1.5">
            ขั้นตอนที่ 1 จาก 3 — บอกรายละเอียดธุระของคุณ
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 h-2 rounded-full bg-primary" />
          <div className="flex-1 h-2 rounded-full bg-border" />
          <div className="flex-1 h-2 rounded-full bg-border" />
        </div>

        <div className="bg-card border border-border rounded-[20px] p-9 flex flex-col gap-7">
          <div>
            <label className="text-lg font-bold block mb-2.5">
              ประเภทธุระ
            </label>
            <div className="grid grid-cols-2 gap-3.5">
              {serviceOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setServiceType(type)}
                  className={`flex items-center gap-3 rounded-2xl px-4.5 py-4 text-lg font-semibold cursor-pointer border-2 text-left ${
                    serviceType === type
                      ? "border-primary bg-mint text-primary-dark"
                      : "border-border bg-card text-ink"
                  }`}
                >
                  {serviceTypeIcon(type)} {serviceTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-lg font-bold block mb-2.5">
              วันที่ต้องการ
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full box-border text-lg px-4.5 py-4 rounded-2xl border-2 border-border bg-card text-ink focus:outline-3 focus:outline-mint focus:border-primary"
            />
          </div>

          <div>
            <label className="text-lg font-bold block mb-2.5">
              เวลาที่ต้องการ
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full box-border text-lg px-4.5 py-4 rounded-2xl border-2 border-border bg-card text-ink focus:outline-3 focus:outline-mint focus:border-primary"
            />
          </div>

          <div>
            <label className="text-lg font-bold block mb-2.5">
              จุดรับ (ต้นทาง)
            </label>
            <input
              type="text"
              placeholder="เช่น บ้านเลขที่ 12 ซอยลาดพร้าว 15"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full box-border text-lg px-4.5 py-4 rounded-2xl border-2 border-border bg-card text-ink focus:outline-3 focus:outline-mint focus:border-primary"
            />
          </div>

          <div>
            <label className="text-lg font-bold block mb-2.5">
              จุดหมาย (ปลายทาง)
            </label>
            <input
              type="text"
              placeholder="เช่น โรงพยาบาลศิริราช"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              className="w-full box-border text-lg px-4.5 py-4 rounded-2xl border-2 border-border bg-card text-ink focus:outline-3 focus:outline-mint focus:border-primary"
            />
          </div>

          <div>
            <label className="text-lg font-bold block mb-2.5">
              รายละเอียดเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              rows={3}
              placeholder="เช่น ต้องใช้รถเข็น หรือ นัดตรวจ 11 โมง"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full box-border text-lg px-4.5 py-4 rounded-2xl border-2 border-border bg-card text-ink focus:outline-3 focus:outline-mint focus:border-primary"
            />
          </div>
        </div>

        {error && (
          <p className="text-danger text-base font-semibold text-right m-0">
            {error}
          </p>
        )}

        <button
          onClick={handleNext}
          className="self-end flex items-center justify-center gap-2.5 min-h-[60px] rounded-2xl bg-primary text-white text-xl font-bold border-none shadow-[0_4px_0_var(--primary-dark)] cursor-pointer px-8"
        >
          ถัดไป: เลือกผู้ช่วยเดินทาง
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="#fff"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
