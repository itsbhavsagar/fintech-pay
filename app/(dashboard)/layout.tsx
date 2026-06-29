import { redirect } from "next/navigation";
import { DatabaseUnavailable } from "@/components/shared/DatabaseUnavailable";
import { DashboardFloatingAssistant } from "@/components/layout/DashboardFloatingAssistant";
import { DashboardPrefetcher } from "@/components/layout/DashboardPrefetcher";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getSessionUser } from "@/lib/auth";
import { isDatabaseConnectionError } from "@/lib/db-errors";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  let user;

  try {
    user = await getSessionUser();
  } catch (error: unknown) {
    if (isDatabaseConnectionError(error)) {
      return <DatabaseUnavailable />;
    }
    throw error;
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar user={user} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
            {children}
          </main>
          <DashboardPrefetcher />
          <DashboardFloatingAssistant />
        </div>
      </div>
    </div>
  );
}
