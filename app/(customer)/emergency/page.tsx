import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmergencyConfirmClient } from "./EmergencyConfirmClient";

export default async function EmergencyConfirmPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("address")
    .eq("id", user.id)
    .single();

  return (
    <EmergencyConfirmClient
      userId={user.id}
      savedAddress={profile?.address ?? ""}
    />
  );
}
