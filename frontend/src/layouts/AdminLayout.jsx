import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/AppSidebar"

export default function PlatformAdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">

        <AppSidebar />

        <div className="flex-1">
          {/* Top bar */}
          <header className="h-14 flex items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Health Connect — Platform Admin</h1>
          </header>

          {/* Page Content */}
          <main className="p-6">
            <Outlet />
          </main>
        </div>

      </div>
    </SidebarProvider>
  )
}
