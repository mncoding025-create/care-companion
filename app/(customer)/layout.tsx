import { EmergencyFAB } from "@/components/customer/EmergencyFAB";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <EmergencyFAB />
    </>
  );
}
