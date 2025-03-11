import { SidebarIcon } from "lucide-react"

import { SearchForm } from "../components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "../components/ui/button"
import { Separator } from "../components/ui/separator"
import { useSidebar } from "../components/ui/sidebar"

// Import the shared sidebar data
import { data } from "@/data/sidebarData"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()

  // Get the active nav item from the sidebar data.
  // Fallback to the first item if none are active.
  const activeNav =
    data.navMain.find((item) => item.isActive) || data.navMain[0]

  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {/* Home/Brand Link */}
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                MekinaHub
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {/* Active Sidebar Item */}
            <BreadcrumbItem>
              <BreadcrumbPage>{activeNav.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  )
}
