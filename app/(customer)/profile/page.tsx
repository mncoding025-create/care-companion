import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/customer/Sidebar";
import { ProfileInfoClient } from "./ProfileInfoClient";
import { EmergencyContactsClient } from "./EmergencyContactsClient";

export default async function CustomerProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, address")
    .eq("id", user.id)
    .single();

  const { count: completedCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", user.id)
    .eq("status", "completed");

  const { data: contacts } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: true });

  const fullName = profile?.full_name ?? "";

  return (
    <div className="flex min-h-screen">
      <Sidebar active="profile" fullName={fullName} />

      <div className="flex-1 px-5 py-6 md:px-14 md:py-10 flex flex-col gap-6 max-w-[900px] pb-24 md:pb-10">
        <div className="text-[26px] md:text-[30px] font-extrabold text-ink">
          โปรไฟล์ของฉัน
        </div>

        <ProfileInfoClient
          userId={user.id}
          fullName={fullName}
          phone={profile?.phone ?? null}
          address={profile?.address ?? null}
          completedCount={completedCount ?? 0}
        />

        <EmergencyContactsClient
          customerId={user.id}
          initialContacts={contacts ?? []}
        />
      </div>
    </div>
  );
}
