import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const roleHome: Record<string, string> = {
  customer: "/dashboard",
  companion: "/jobs",
  admin: "/admin/dashboard",
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const cookieStore = await cookies();
      const pendingRole = cookieStore.get("pending_role")?.value;
      cookieStore.delete("pending_role");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, created_at")
        .eq("id", data.user.id)
        .single();

      // Only honor the pending role on the very first sign-in (profile just
      // created by the on_auth_user_created trigger, defaulted to customer).
      const isFreshProfile =
        profile &&
        Date.now() - new Date(profile.created_at).getTime() < 60_000;

      if (
        isFreshProfile &&
        pendingRole === "companion" &&
        profile.role !== "companion"
      ) {
        await supabase
          .from("profiles")
          .update({ role: "companion" })
          .eq("id", data.user.id);
        await supabase
          .from("companion_details")
          .upsert({ profile_id: data.user.id });
        return NextResponse.redirect(`${origin}${roleHome.companion}`);
      }

      const home = profile ? roleHome[profile.role] : "/login";
      return NextResponse.redirect(`${origin}${home}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
