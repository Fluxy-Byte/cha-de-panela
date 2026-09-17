import { requireUser } from "@/lib/dal";
import { LogoutButton } from "@/components/dashboard/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="flex items-center justify-between border-b bg-background px-6 py-4">
        <div>
          <p className="font-heading text-sm font-medium">Chá de Panela</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <LogoutButton />
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
