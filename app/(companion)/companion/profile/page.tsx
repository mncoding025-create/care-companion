import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/companion/Sidebar";
import { CompanionProfileClient } from "./CompanionProfileClient";

export default async function CompanionProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: details } = await supabase
    .from("companion_details")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  return (
    <div className="flex min-h-screen">
      <Sidebar active="profile" />
      <CompanionProfileClient
        profileId={user.id}
        fullName={profile?.full_name ?? ""}
        ratingAvg={details?.rating_avg ?? 0}
        totalJobs={details?.total_jobs ?? 0}
        isVerified={details?.is_verified ?? false}
        initialExperience={details?.experience_text ?? ""}
        initialServiceAreas={details?.service_areas ?? []}
        initialAvailableDays={details?.available_days ?? []}
        initialStartTime={details?.available_start_time?.slice(0, 5) ?? ""}
        initialEndTime={details?.available_end_time?.slice(0, 5) ?? ""}
      />
    </div>
  );
}
