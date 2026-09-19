import { LinkButton } from "@/components/ui/Button";

function HeartIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s-7.5-4.6-10-9.3C.5 8 2.2 4.5 5.6 4c2-.3 3.8.6 5 2 1.2-1.4 3-2.3 5-2 3.4.5 5.1 4 3.6 7.7C19.5 16.4 12 21 12 21z"
        fill="#E38B6B"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"
        fill="#2F7A68"
      />
    </svg>
  );
}

function CompanionIllustration() {
  return (
    <svg width="280" height="280" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill="#2F7A68" />
      <path
        d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"
        stroke="#2F7A68"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="18" cy="7" r="3.2" fill="#E38B6B" />
    </svg>
  );
}

const steps = [
  {
    n: 1,
    title: "บอกความต้องการ",
    desc: "ระบุวัน เวลา และสถานที่ที่ต้องการให้ผู้ช่วยไปรับ-ส่ง",
  },
  {
    n: 2,
    title: "เลือกผู้ช่วยที่ไว้ใจ",
    desc: "ดูโปรไฟล์ คะแนนรีวิว และเลือกผู้ช่วยที่เหมาะกับคุณ",
  },
  {
    n: 3,
    title: "เดินทางอย่างอุ่นใจ",
    desc: "ติดตามสถานะได้ตลอดการเดินทาง มีทีมงานพร้อมช่วยเหลือ",
  },
];

const stats = [
  { value: "1,200+", label: "ผู้ช่วยที่ผ่านการตรวจสอบ" },
  { value: "4.9/5", label: "คะแนนความพึงพอใจ" },
  { value: "24 ชม.", label: "ทีมดูแลพร้อมช่วยเหลือ" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-5 md:px-16 py-5 md:py-6 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <HeartIcon />
          <span className="text-xl md:text-[26px] font-extrabold text-primary-dark">
            Care Companion
          </span>
        </div>
        <nav className="flex items-center gap-4 md:gap-8">
          <a
            href="#"
            className="hidden sm:inline text-lg font-semibold no-underline text-ink"
          >
            วิธีใช้งาน
          </a>
          <a
            href="#"
            className="hidden sm:inline text-lg font-semibold no-underline text-ink"
          >
            สำหรับผู้ให้บริการ
          </a>
          <LinkButton href="/login" variant="outline" size="md">
            เข้าสู่ระบบ
          </LinkButton>
        </nav>
      </header>

      <section className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 px-5 py-12 md:px-16 md:py-20 bg-gradient-to-b from-sky to-bg-cream">
        <div className="flex-1 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 bg-mint text-primary-dark font-bold text-base px-4 py-2 rounded-full w-fit">
            <SparkleIcon />
            ดูแลด้วยใจ ปลอดภัยทุกการเดินทาง
          </div>
          <h1 className="text-[34px] sm:text-[42px] lg:text-[52px] leading-[1.3] font-extrabold m-0 text-ink">
            เพื่อนเดินทาง
            <br />
            ที่ไว้ใจได้ ในทุกก้าวของคุณ
          </h1>
          <p className="text-lg lg:text-xl leading-relaxed text-sub m-0 max-w-[560px]">
            Care Companion ช่วยจับคู่ผู้สูงอายุและผู้ที่เดินทางคนเดียวไม่สะดวก
            กับผู้ช่วยเดินทางที่ผ่านการตรวจสอบแล้ว พร้อมดูแลทุกขั้นตอน
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <LinkButton href="/login?role=customer">
              เริ่มต้นใช้งาน
            </LinkButton>
            <LinkButton href="/login?role=companion" variant="outline">
              สมัครเป็นผู้ช่วยเดินทาง
            </LinkButton>
          </div>
          <div className="flex flex-wrap gap-6 sm:gap-10 mt-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl sm:text-[28px] font-extrabold text-primary-dark">
                  {s.value}
                </div>
                <div className="text-base text-sub">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[460px] lg:h-[460px] rounded-[32px] bg-mint flex items-center justify-center overflow-hidden shadow-[0_20px_40px_rgba(47,122,104,0.15)]">
            <CompanionIllustration />
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-16 md:py-18 bg-card">
        <h2 className="text-center text-2xl md:text-4xl font-extrabold mb-8 md:mb-12">
          ใช้งานง่ายเพียง 3 ขั้นตอน
        </h2>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center md:flex-wrap">
          {steps.map((step) => (
            <div
              key={step.n}
              className="flex-1 md:max-w-[340px] bg-bg-cream rounded-2xl p-6 md:p-8 flex flex-col gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-extrabold">
                {step.n}
              </div>
              <div className="text-xl font-bold">{step.title}</div>
              <div className="text-base text-sub leading-relaxed">
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-5 py-6 md:px-16 md:py-8 bg-primary-dark text-white flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center text-center sm:text-left mt-auto">
        <span className="text-lg font-bold">Care Companion</span>
        <span className="text-sm opacity-85">
          ติดต่อทีมสนับสนุน 24 ชั่วโมง: 02-xxx-xxxx
        </span>
      </footer>
    </div>
  );
}
