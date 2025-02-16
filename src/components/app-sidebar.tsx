import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  Car,
  Store,
  MessageSquare
} from "lucide-react"

import DealerDashboard from "@/pages/DealerDashboard"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
// user data come from the database
  user: {
    name: "Walid Murad",
    email: "mekinahub@gmail.com",
    avatar: "../assets/Herobg.jpg",
  },
  navMain: [
    {
      title: "Car Showroom",
      url: "/Showroom",
      icon: Car,
      isActive: true,
      items: [
        {
          title: "3D Car Models",
          url: "#",
        },
        {
          title: "Car Comparison",
          url: "#",
        },
        
      ],
    },
    {
      title: "Marketplace",
      url: "/Marketplace",
      icon: Store,
      items: [
        {
          title: "Dealer Analytics",    
          url: "#",
        },
        {
          title: "Get Verified",
          url: "#",
        },
        {
          title: "Manage Listings",
          url: "#",
        },
        
      ],
    },
    {
      title: "Dealer Dashboard",
      url: "/DealerDashboard",
      icon: BookOpen,
      items: [
        {
          title: "Dealership Profile",
          url: "/DealerDashboard",
        },

        {
          title: "Reports",
          url: "/DealerDashboard",
        },
      ],
    },
   
    {
      title: "Messages",
      url: "#",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "#",
        },
        
        {
          title: "Billing",
          url: "#",
        },
        
      ],
    },
  ],
  navSecondary: [
    {
        title: "Chat",
        url: "#",
        icon: Bot,
    },
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
      <Sidebar
        // Pin the sidebar to the left, from top of header to bottom of the viewport
        className="
          fixed left-0 
          top-[--header-height] 
          bottom-0 
          z-50 
          w-[250px] 
          flex 
          flex-col 
          bg-sidebar-primary 
          text-white
        "
        {...props}
      >
        {/* Sidebar Header */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="border-b border-primary-800"
              >
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate text-blue-300 font-semibold">
                      MekinaHub
                    </span>
                    <span className="truncate text-blue-300 text-xs">
                      Making your decision easier!
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
  
        {/* Make the main content area flex-1 and scrollable */}
        <div className="flex-1 overflow-y-auto">
          <SidebarContent>
            <NavMain items={data.navMain} />
            <NavSecondary items={data.navSecondary} className="mt-auto" />
          </SidebarContent>
        </div>
  
        {/* Sidebar Footer */}
        <SidebarFooter className="border-t border-primary-800">
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
    );
  }
  
  
  
