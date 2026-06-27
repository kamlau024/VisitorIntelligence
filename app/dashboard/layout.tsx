import { AppShell } from "@/components/dashboard/app-shell";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Dashboard — Visitor Intelligence",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster />
    </>
  );
}
