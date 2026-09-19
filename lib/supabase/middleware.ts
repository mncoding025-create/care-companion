import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

const roleHome: Record<string, string> = {
  customer: "/dashboard",
  companion: "/jobs",
  admin: "/admin/dashboard",
};

const publicPaths = ["/", "/login"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicPath =
    publicPaths.includes(pathname) || pathname.startsWith("/auth");

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (profile && !profile.is_active && !isPublicPath) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "suspended");
      return NextResponse.redirect(url);
    }

    const home = profile ? roleHome[profile.role] : "/login";

    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    const isCustomerPath =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/book") ||
      pathname.startsWith("/booking") ||
      pathname.startsWith("/history") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/emergency");
    const isCompanionPath =
      pathname.startsWith("/jobs") || pathname.startsWith("/companion");
    const isAdminPath = pathname.startsWith("/admin");

    if (
      profile &&
      ((isCustomerPath && profile.role !== "customer") ||
        (isCompanionPath && profile.role !== "companion") ||
        (isAdminPath && profile.role !== "admin"))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
