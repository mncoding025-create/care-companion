import { LoginCard } from "./LoginCard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const resolvedRole = role === "companion" ? "companion" : "customer";

  return (
    <div className="flex-1 flex items-center justify-center bg-bg-cream px-4 py-16">
      <LoginCard role={resolvedRole} />
    </div>
  );
}
