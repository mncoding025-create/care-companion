# แผนการพัฒนา "Care Companion" — สำหรับ Claude Code

> ไฟล์นี้เขียนเพื่อให้ Claude Code ใช้เป็น spec ในการลงมือ implement ต่อจากขั้นตอน Design + Database ที่ทำเสร็จแล้ว
> อ่านทั้งไฟล์ก่อนเริ่มเขียนโค้ด แล้วทำตามลำดับ Phase 0 → Phase 9 ห้ามข้ามลำดับ เพราะ phase หลังพึ่งพา phase ก่อนหน้า

---

## 0. บริบทของโปรเจกต์

**เป้าหมาย:** เว็บแอป "Care Companion" — แพลตฟอร์มจับคู่ผู้สูงอายุ/ผู้ที่เดินทางคนเดียวไม่สะดวก (Customer) กับผู้ช่วยเดินทาง (Companion) โดยมี Admin บริหารระบบ พร้อมฟีเจอร์ขอความช่วยเหลือฉุกเฉิน

**Deadline:** ส่งงาน (GitHub repo + Vercel link) ก่อนวันอาทิตย์ 27 ก.ย. 24:00 น. / นำเสนอวันพุธ 30 ก.ย. 10:00 น.

**Tech Stack (ตายตัว ห้ามเปลี่ยน):**
- Frontend/Full Stack: Next.js (App Router) + TailwindCSS
- Auth: Google Account ผ่าน Supabase Authentication
- Database: Supabase PostgreSQL
- File Storage: Supabase Storage
- Deploy: Vercel

**สถานะปัจจุบัน (ทำเสร็จแล้ว ไม่ต้องทำซ้ำ):**
- ✅ UX/UI mockup ครบทุกหน้า (อ้างอิงหัวข้อ 2)
- ✅ Supabase project ชื่อ "Care Companion" สร้างแล้ว พร้อม schema + RLS เต็มรูปแบบ (อ้างอิงหัวข้อ 3)

---

## 1. Environment Setup

สร้างไฟล์ `.env.local` ที่ root ของโปรเจกต์ Next.js:

```
NEXT_PUBLIC_SUPABASE_URL=https://tzttswhootmkamrsokob.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rweLh5H5OvnIiLs5RIwQ8w_AAm0WpJu
```

- Project ID (สำหรับ Supabase CLI/MCP ถ้าต้องใช้): `tzttswhootmkamrsokob`
- เพิ่ม `.env.local` ใน `.gitignore` (แม้ค่าที่ให้มาจะเป็น public anon key ที่ปลอดภัยต่อการ expose แต่ให้ทำตาม best practice)
- ต้อง setup ทั้ง Local dev env และ Vercel Environment Variables (ตอน deploy) ให้ตรงกัน

---

## 2. Design System — ต้อง Implement ให้ตรงตามนี้เป๊ะ

ทีม design ทำ mockup ไว้แล้วในสไตล์เดียวกันทุกหน้า ให้สกัด design tokens ต่อไปนี้ใส่ใน `tailwind.config.js` และ global CSS ก่อนเริ่มเขียนหน้าใดๆ

### สี (CSS variables)
```css
--bg-cream:   #FBF7EE   /* พื้นหลังหลักทั้งแอป */
--mint:       #E4F3EA   /* accent เขียวอ่อน / การ์ด active */
--sky:        #E7F2FA   /* accent ฟ้าอ่อน */
--ink:        #2C2A24   /* สีตัวอักษรหลัก */
--sub:        #5B584D   /* สีตัวอักษรรอง */
--primary:    #2F7A68   /* เขียวเข้ม ปุ่มหลัก/แบรนด์ */
--primary-dark:#1F5C4E  /* เขียวเข้มกว่า สำหรับ hover/shadow */
--accent:     #E38B6B   /* ส้ม แบรนด์/หัวใจโลโก้ */
--card:       #FFFFFF
--border:     #E5DFCE
--warm-red:   #FBEAE7   /* พื้นหลังโซนฉุกเฉิน */
--danger:     #B3261E   /* แดง สำหรับปุ่ม/สถานะฉุกเฉินเท่านั้น */
--danger-deep:#7A1F17   /* shadow ของปุ่มแดง */
```

### ฟอนต์
- ใช้ **Sarabun** (Google Fonts) ทั้งแอป น้ำหนัก 400/500/600/700/800
- โหลดผ่าน `next/font/google` แทนการลิงก์ `<link>` ตรงๆ เพื่อ performance ที่ดีกว่า

### หลัก Elderly-Friendly ที่ต้องคุมตลอดทุกหน้า (ฝั่ง Customer)
- ตัวอักษรพื้นฐาน ≥16-18px, หัวข้อใหญ่ชัดเจน
- ปุ่มขั้นต่ำ 48-56px สูง, ปุ่มสำคัญ (เรียกผู้ช่วย, ยืนยัน) ใหญ่กว่านั้นชัดเจน (64-76px)
- ทุกปุ่ม/action สำคัญมี icon + ข้อความคู่กันเสมอ ห้ามใช้ icon เดี่ยวๆ
- ปุ่มที่แก้ไขยาก (ยกเลิกการจอง, ยกเลิกคำขอฉุกเฉิน) ต้องมี confirm modal เสมอ — ห้ามลืมจุดนี้เด็ดขาด เพราะเป็นจุดที่ตกลงกันไว้เฉพาะ

---

## 3. Database Schema (สร้างไว้แล้วใน Supabase — ใช้ MCP Supabase tool อ่านของจริงก่อนเขียนโค้ด ห้ามเดา)

**คำสั่งแรกที่ต้องทำ:** เรียก Supabase MCP `list_tables` (project_id: `tzttswhootmkamrsokob`, verbose: true) เพื่อดึง schema ปัจจุบันแบบเป๊ะๆ (column, type, FK) มาใช้อ้างอิงตอนเขียน TypeScript types แทนการพิมพ์เองจากไฟล์นี้ เพราะไฟล์นี้เป็นแค่สรุปย่อ

### ตารางที่มีอยู่ (สรุปย่อ)
| ตาราง | หน้าที่ |
|---|---|
| `profiles` | id (=auth.users.id), full_name, phone, role (customer/companion/admin), is_active |
| `companion_details` | profile_id (PK/FK), experience_text, service_areas[], available_days[], available_start_time, available_end_time, vehicle_info, is_verified, rating_avg, rating_count, total_jobs |
| `emergency_contacts` | id, customer_id, name, phone, relationship |
| `bookings` | id, customer_id, companion_id (nullable), service_type (hospital/shopping/bank_government/general), scheduled_date, scheduled_time, pickup_address, destination_address, details, status (pending/accepted/in_progress/completed/cancelled), is_emergency, price, timestamps |
| `emergency_broadcasts` | id, booking_id, companion_id, notified_at, response (pending/accepted/declined/expired), responded_at |
| `reviews` | id, booking_id (unique), customer_id, companion_id, rating (1-5), comment |
| `complaints` | id, booking_id, reporter_id, against_id, category, description, status (pending/investigating/resolved), is_urgent, admin_notes |

### RLS ที่ตั้งไว้แล้ว (ห้ามแก้ policy เว้นแต่เจอบั๊กจริง)
- Customer เห็น/แก้ไขได้เฉพาะ booking และ emergency_contacts ของตัวเอง
- Companion เห็นงานที่ตัวเองถูก assign + งาน pending ที่ยังไม่มีคนรับ (job pool)
- Admin ผ่านฟังก์ชัน `is_admin()` เข้าถึงทุกตาราง
- Trigger `on_auth_user_created` สร้างแถว `profiles` อัตโนมัติทุกครั้งที่ signup ผ่าน Google (อ่าน `role` จาก `raw_user_meta_data` ถ้ามี ไม่งั้น default เป็น `customer`)

### สิ่งที่ต้อง generate เพิ่ม
- รัน Supabase CLI หรือ MCP tool เพื่อ generate TypeScript types จาก schema จริง (`generate_typescript_types`) แล้วเก็บไว้ที่ `types/supabase.ts` — ใช้ type นี้ทุกที่ที่ query ห้าม `any`

---

## 4. โครงสร้างโปรเจกต์ (Next.js App Router)

```
/app
  /(public)
    /page.tsx                     → Landing
    /login/page.tsx                → Login (Google button)
  /(customer)
    layout.tsx                     → sidebar เมนู Customer + auth guard (role=customer)
    /dashboard/page.tsx            → CustomerDashboard
    /book/page.tsx                 → BookingForm (3 step wizard)
    /book/search/page.tsx          → CompanionSearch (step 2)
    /booking/[id]/page.tsx         → BookingTracking
    /history/page.tsx              → BookingHistory
    /profile/page.tsx              → CustomerProfile (+ Emergency Contacts CRUD)
    /emergency/page.tsx            → EmergencyConfirm
    /emergency/status/page.tsx     → EmergencyStatus
  /(companion)
    layout.tsx                     → sidebar เมนู Companion + auth guard (role=companion)
    /jobs/page.tsx                 → CompanionJobs (งานเข้ามาใหม่ + งานปัจจุบัน)
    /profile/page.tsx              → CompanionProfile
  /(admin)
    layout.tsx                     → sidebar เมนู Admin (สีเข้ม) + auth guard (role=admin)
    /dashboard/page.tsx            → AdminDashboard
    /users/page.tsx                → AdminUsers
    /complaints/page.tsx           → AdminComplaints
  /auth/callback/route.ts          → Supabase OAuth callback handler
/components
  /ui/                             → ปุ่ม, การ์ด, modal, badge ที่ใช้ร่วมกันตาม design tokens
  /booking/                        → BookingCard, StatusTimeline, DestinationPicker
  /emergency/                      → EmergencyButton (floating), ConfirmModal, CancelModal
/lib
  /supabase/client.ts              → browser client
  /supabase/server.ts              → server client (สำหรับ Server Components/Actions)
  /supabase/middleware.ts          → session refresh
/types/supabase.ts                 → generated types
middleware.ts                      → protect routes ตาม role, redirect ถ้ายังไม่ login
```

---

## 5. ลำดับการพัฒนา (ทำเรียงตาม Phase ห้ามข้าม)

### Phase 0 — Project Bootstrap
1. `npx create-next-app@latest` (TypeScript, Tailwind, App Router, ESLint)
2. ติดตั้ง `@supabase/supabase-js` และ `@supabase/ssr`
3. ตั้งค่า `.env.local` ตามหัวข้อ 1
4. เซ็ต Tailwind theme extend ด้วย design tokens ในหัวข้อ 2 + โหลดฟอนต์ Sarabun
5. สร้าง Supabase client helpers (browser + server) ตาม pattern ของ `@supabase/ssr`
6. Generate TypeScript types จาก schema จริงตามหัวข้อ 3

**Checkpoint ก่อนไป Phase ถัดไป:** รัน `npm run dev` ขึ้นหน้าเปล่าได้ ไม่มี error เรื่อง env/connection

---

### Phase 1 — Authentication
1. หน้า `/login` ตามดีไซน์ (การ์ดกลางจอ, ปุ่ม "เข้าสู่ระบบด้วย Google", ลิงก์กลับหน้าแรก)
2. ตั้งค่า Google OAuth provider ใน Supabase Dashboard (ต้องขอ Google Client ID/Secret เอง — แจ้ง user ถ้าต้องทำเอง)
3. Sign-in flow: Supabase `signInWithOAuth({ provider: 'google' })` → callback route ที่ `/auth/callback` → เช็ก `profiles.role` → redirect ไปหน้า dashboard ตาม role (customer/companion/admin)
4. **สำคัญ:** ตอน signup ครั้งแรกต้องมีวิธีให้ผู้ใช้เลือกว่าจะสมัครเป็น Customer หรือ Companion (ปุ่ม "เริ่มต้นใช้งาน" vs "สมัครเป็นผู้ช่วยเดินทาง" ในหน้า Landing แยก role ไว้แล้วตั้งแต่ query param หรือ separate signup path) แล้วส่งค่า `role` ผ่าน `options.data` ตอนเรียก OAuth เพื่อให้ trigger `handle_new_user` สร้าง profile ถูก role
5. Middleware ป้องกันเส้นทาง: ยังไม่ login → redirect `/login`; login แล้วแต่ role ไม่ตรงกับ route group → redirect ไป dashboard ของ role ตัวเอง

**Checkpoint:** login ด้วย Google ได้จริง, มีแถวใน `profiles` ถูกสร้างอัตโนมัติ, redirect ตาม role ถูกต้อง

---

### Phase 2 — Customer: หน้าหลักและการจองปกติ
ทำตามลำดับหน้าในดีไซน์เป๊ะๆ:

1. **CustomerDashboard** — ทักทายด้วยชื่อจริงจาก `profiles.full_name`, ปุ่ม "เรียกผู้ช่วยเดินทาง" (ลิงก์ไป `/book`), การ์ด "การจองที่กำลังจะถึง" (ดึงจาก `bookings` ที่ status ยังไม่ completed/cancelled เรียงตาม scheduled_date), การ์ด 4 ประเภทบริการ (พาไปหาหมอ/จ่ายตลาด/ธนาคาร-ราชการ/เดินทางทั่วไป) กดแล้ว pre-fill service_type ใน BookingForm

2. **BookingForm** (ขั้นตอนที่ 1/3) — ฟอร์ม: ประเภทธุระ (4 ปุ่มเลือก), วันที่, เวลา, จุดรับ (default = ที่อยู่ผู้ใช้ ถ้ามี), จุดหมาย, รายละเอียดเพิ่มเติม → บันทึกเป็น draft ใน state/URL params ก่อน ยังไม่ insert DB จนกว่าจะยืนยันตอนจบ step 3

3. **CompanionSearch** (ขั้นตอนที่ 2/3) — Query `companion_details` join `profiles` ที่ `is_verified = true` และ `service_areas` ครอบคลุมพื้นที่จุดรับ/จุดหมาย, เรียงตาม rating_avg desc, แสดงการ์ด: ชื่อ, avatar initials, rating+จำนวนรีวิว, ประสบการณ์, พื้นที่บริการ, ปุ่ม "เลือกคนนี้" → ปุ่ม "ยืนยันการจอง" ท้ายหน้า insert แถวใหม่ใน `bookings` (status='pending', companion_id=ที่เลือก)

4. **BookingTracking** — แสดงสถานะ real-time (ใช้ Supabase Realtime subscribe ตาราง `bookings` filter โดย id) พร้อม timeline (ยืนยันแล้ว → ผู้ช่วยกำลังมารับ → ถึงจุดหมาย), การ์ดข้อมูล Companion (โทร/แชท), **ปุ่ม "ยกเลิกการจอง" ต้องมี confirm modal ก่อนเสมอ** (จุดนี้เคยพลาดไม่มีมาก่อน ต้องใส่ตั้งแต่แรก)

5. **BookingHistory** — list จาก `bookings` ของ customer เรียงตามวันที่ล่าสุดก่อน, badge สถานะสี (เสร็จสิ้น=เขียว, ยกเลิกแล้ว=แดงอ่อน), แสดงราคาถ้ามี

6. **CustomerProfile** — แก้ไขข้อมูลส่วนตัว + section "ผู้ติดต่อฉุกเฉิน" (CRUD เต็มรูปแบบกับตาราง `emergency_contacts`: เพิ่ม/แก้ไข/ลบ อย่างน้อย 1-2 คน มีชื่อ/เบอร์/ความสัมพันธ์)

**Checkpoint:** จองงานปกติได้ครบ flow ตั้งแต่เลือกบริการ → เลือก companion → ติดตามสถานะ → ยกเลิกได้ (มี confirm) → เห็นในประวัติ

---

### Phase 3 — ฟีเจอร์ขอความช่วยเหลือฉุกเฉิน (จุดที่ต้องระวังที่สุด)

1. **ปุ่มลอยฉุกเฉิน** — component ลอยมุมล่างขวา แสดงทุกหน้าใน `(customer)` layout ยกเว้นหน้า emergency เอง

2. **EmergencyConfirm** —
   - Auto-detect ตำแหน่งปัจจุบัน (Geolocation API ของ browser, fallback เป็นที่อยู่ที่บันทึกไว้ถ้า user ปฏิเสธสิทธิ์)
   - ดึงสถานที่แนะนำ (โรงพยาบาล/คลินิกใกล้เคียง) — ถ้าไม่มี API ภายนอกให้ mock เป็น static list ตาม area ก่อนได้ (ระบุ TODO ไว้)
   - ปุ่ม "ยืนยัน ขอความช่วยเหลือทันที" **ต้องเปิด confirm modal ก่อนเสมอ** ("คุณต้องการขอความช่วยเหลือด่วนใช่ไหมคะ?") ตามที่ตกลงกันไว้ — ห้ามให้กดครั้งเดียวจบ
   - กด "ใช่" ใน modal → insert `bookings` (is_emergency=true, status='pending', companion_id=null) → insert `emergency_broadcasts` ให้ companion ทุกคนที่ `is_verified=true` และ area ตรงกัน (status='pending') → redirect ไป EmergencyStatus
   - แถบเตือน "ไม่ใช่รถพยาบาล" + ปุ่มโทร 1669 ต้องอยู่ในหน้านี้เสมอ ห้ามเอาออก

3. **EmergencyStatus** —
   - Subscribe realtime ตาราง `bookings` (id ของ emergency booking) — เมื่อ `companion_id` ถูกเซ็ต (มีคนรับ) เปลี่ยน UI จาก "กำลังติดต่อ..." เป็นการ์ดข้อมูล Companion + ปุ่มโทร
   - ปุ่ม "ยกเลิกคำขอ" **ต้องมี confirm modal ก่อนเสมอ** ("ยกเลิกคำขอความช่วยเหลือ? ผู้ช่วยที่กำลังเดินทางมาหาคุณจะได้รับแจ้งว่าคำขอถูกยกเลิก")
   - ตั้ง timeout ฝั่ง client (เช่น 3-5 นาที) ถ้ายังไม่มีใครรับ → แสดงข้อความแนะนำให้โทร 1669 เด่นขึ้น (ไม่ต้อง auto-cancel ให้ user ตัดสินใจเอง)

4. **CompanionJobs (ฝั่ง Companion)** — การ์ดงานที่มาจาก emergency ต้องมี: ขอบแดง 3px, badge "🔴 ด่วน" ลอยมุมบน, countdown เวลาที่เหลือให้ตอบรับ (นับถอยหลังจาก `emergency_broadcasts.notified_at` + เวลาที่กำหนด เช่น 5 นาที), ปุ่ม "รับงานนี้" ใหญ่กว่าปุ่มงานปกติ — กดรับ → update `bookings.companion_id` + `status='accepted'` (ใช้ transaction/RPC function เพื่อกันปัญหา race condition ถ้ามีหลายคนกดพร้อมกัน ให้คนแรกที่กด "ชนะ" เท่านั้น คนอื่น broadcast แถวของตัวเองเปลี่ยนเป็น 'expired')

**Checkpoint:** กดปุ่มฉุกเฉิน → ต้องผ่าน modal ยืนยันก่อน → broadcast ไปหลาย companion → companion คนแรกกดรับ → คนอื่นเห็นงานหายไปจาก list → customer เห็นข้อมูล companion ทันที (realtime) → ยกเลิกได้ทุกจุดโดยมี confirm

---

### Phase 4 — Companion: โปรไฟล์และจัดการงาน
1. **CompanionProfile** — ฟอร์มแก้ไข `companion_details` (ประสบการณ์, พื้นที่บริการแบบ tag เพิ่ม/ลบได้, วันที่ว่างแบบ toggle 7 วัน, เวลาเริ่ม-สิ้นสุด)
2. **CompanionJobs** — สอง section: "งานที่เข้ามาใหม่" (pending + broadcast ของ companion นี้) และ "งานปัจจุบัน" (booking ที่ตัวเอง accepted/in_progress) พร้อมปุ่มอัปเดตสถานะ (ถึงจุดรับแล้ว → กำลังเดินทาง → เสร็จสิ้น)

**Checkpoint:** Companion แก้โปรไฟล์ได้, เห็นงานใหม่ทั้งปกติและฉุกเฉิน, รับ/ปฏิเสธงานได้, อัปเดตสถานะงานได้จนจบ

---

### Phase 5 — Admin
1. **AdminDashboard** — stat cards (การจองวันนี้, ผู้ช่วยออนไลน์, ผู้ใช้ทั้งหมด, ข้อร้องเรียนค้างอยู่) ดึงจาก aggregate query จริง ไม่ hardcode, ตาราง "การจองล่าสุด" 5-10 รายการ
2. **AdminUsers** — list customer/companion แยก tab, ค้นหาด้วยชื่อ/เบอร์, ปุ่มระงับ/ยกเลิกระงับบัญชี (update `profiles.is_active`)
3. **AdminComplaints** — list ข้อร้องเรียนจาก `complaints`, คลิกดูรายละเอียด, ปุ่มบันทึกว่าแก้ไขแล้ว/ระงับผู้ช่วยชั่วคราว (update `status`, `admin_notes`, `resolved_at`)

**Checkpoint:** Admin เห็นภาพรวมจริงจาก DB, จัดการ user/complaint ได้จริง ไม่ใช่ mock data

---

### Phase 6 — Realtime & Business Logic เสริม
- Trigger ฝั่ง DB (Postgres function) อัปเดต `companion_details.rating_avg`/`rating_count` อัตโนมัติเมื่อมี insert ใน `reviews`
- Trigger อัปเดต `companion_details.total_jobs` เมื่อ booking status เปลี่ยนเป็น 'completed'
- RPC function `accept_emergency_job(booking_id, companion_id)` ที่เช็ก atomic ว่า booking ยังไม่มีคน accept ก่อนอัปเดต (กัน race condition ตามที่พูดใน Phase 3)

---

### Phase 7 — Responsive & QA Pass
- ทดสอบทุกหน้าบนขนาดจอมือถือ (Customer ใช้มือถือเป็นหลักตอนฉุกเฉิน) และ desktop/tablet (Customer ใช้ตอนจองปกติ)
- เช็ก checklist safety ที่ตกลงกันไว้ทั้งหมด:
  - [ ] Modal ยืนยันก่อนส่งคำขอฉุกเฉิน
  - [ ] Modal ยืนยันก่อนยกเลิกคำขอฉุกเฉิน
  - [ ] Modal ยืนยันก่อนยกเลิกการจองปกติ
  - [ ] ปุ่ม/ตัวอักษรขนาดใหญ่พอฝั่ง Customer ทุกหน้า
  - [ ] คำเตือน "ไม่ใช่รถพยาบาล" + ปุ่มโทร 1669 อยู่ในหน้า EmergencyConfirm
  - [ ] การ์ดงานฉุกเฉินฝั่ง Companion แยกสายตาชัดจากงานปกติ

---

### Phase 8 — Deploy
1. Push โค้ดขึ้น GitHub repo
2. Connect repo กับ Vercel, ตั้งค่า Environment Variables ให้ตรงกับ `.env.local`
3. Deploy และทดสอบ flow ทั้งหมดบน URL จริงอีกรอบ (โดยเฉพาะ Google OAuth redirect URL ต้องเพิ่ม production URL ใน Supabase Auth settings ด้วย ไม่งั้น login จะ fail บน production)

---

### Phase 9 — Submission Checklist
- [ ] ลิงก์ GitHub Repo (public หรือแชร์สิทธิ์ให้อาจารย์เข้าถึงได้)
- [ ] ลิงก์เว็บที่ deploy บน Vercel ใช้งานได้จริง
- [ ] ส่งก่อนวันอาทิตย์ 27 ก.ย. เวลา 24.00 น.
- [ ] เตรียมพร้อม present วันพุธ 30 ก.ย. 10.00 น. ห้อง IT309 (มีการสุ่มเรียก)

---

## 6. หมายเหตุสำหรับ Claude Code

- ทุกครั้งที่ไม่แน่ใจเรื่อง schema จริง ให้เรียก Supabase MCP tool เช็คก่อน อย่าสมมติ column เอง
- ห้ามลบ/แก้ RLS policy ที่มีอยู่โดยไม่จำเป็น เพราะถูกออกแบบมาให้ตรงกับ role ทั้ง 3 ฝั่งแล้ว
- ทุกหน้าต้องใช้ภาษาไทยเป็นหลัก ให้ตรงกับข้อความในไฟล์ดีไซน์ที่ระบุไว้ในแต่ละ Phase
- ถ้าจุดไหนในดีไซน์กับ schema ไม่ตรงกัน (เช่น field ที่ดีไซน์ต้องการแต่ยังไม่มีใน DB) ให้หยุดและถามผู้ใช้ก่อน อย่าเดาแล้วเพิ่ม column เอง
