import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompanionSearchClient, type CompanionOption } from "./CompanionSearchClient";
import type { Database } from "@/types/supabase";

type ServiceType = Database["public"]["Enums"]["service_type"];
const validServiceTypes: ServiceType[] = [
  "hospital",
  "shopping",
  "bank_government",
  "general",
];

export default async function CompanionSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const service = params.service as ServiceType | undefined;
  const { date = "", time = "", pickup, destination, details = "" } = params;

  if (
    !service ||
    !validServiceTypes.includes(service) ||
    !pickup ||
    !destination
  ) {
    redirect("/book");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: companionRows } = await supabase
    .from("companion_details")
    .select(
      "profile_id, experience_text, service_areas, rating_avg, rating_count, profile:profiles!companion_details_profile_id_fkey(full_name)"
    )
    .eq("is_verified", true)
    .order("rating_avg", { ascending: false });

  const allCompanions: CompanionOption[] = (companionRows ?? [])
    .filter((c) => c.profile)
    .map((c) => ({
      profileId: c.profile_id,
      fullName: c.profile!.full_name,
      experienceText: c.experience_text,
      serviceAreas: c.service_areas,
      ratingAvg: c.rating_avg,
      ratingCount: c.rating_count,
    }));

  // Best-effort match: prefer companions whose declared service area appears
  // in the pickup/destination address text. Falls back to the full verified
  // list if nothing matches, since addresses are free text (no structured
  // area field was collected in BookingForm).
  const haystack = `${pickup} ${destination}`.toLowerCase();
  const matched = allCompanions.filter((c) =>
    c.serviceAreas.some((area) => haystack.includes(area.toLowerCase()))
  );
  const companions = matched.length > 0 ? matched : allCompanions;

  return (
    <CompanionSearchClient
      companions={companions}
      draft={{ service, date, time, pickup, destination, details }}
    />
  );
}
