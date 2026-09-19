import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingFormClient } from "./BookingFormClient";

export default async function BookingFormPage() {
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
    <Suspense>
      <BookingFormClient defaultPickupAddress={profile?.address ?? ""} />
    </Suspense>
  );
}
