import React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  HelpCircle,
  Send,
  Car,
  LayoutDashboard,
  Store,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";

import { NavMain } from "../components/nav-main";
import { NavSecondary } from "../components/nav-secondary";
import { NavUser } from "../components/nav-user";

const data = {
  user: {
    name: "Walid Murad",
    email: "mekinahub@gmail.com",
    avatar: "../assets/Herobg.jpg",
  },
  navMain: [
    {
      title: "Car Showroom",
      icon: Car,
      isActive: true,
      url: "/showroom",
      items: [
        {
          title: "3D Car Models",
          url: "/showroom",
        },
        {
          title: "Car Comparison",
          url: "/compare",
        },
      ],
    },
    {
      title: "Marketplace",
      url: "/marketplace",
      icon: Store ,
      items: [
        {
          title: "Dealer Analytics",
          url: "dealeranalytics",
        },
        
       
      ],
    },
    {
      title: "Dealer Dashboard",
      url: "/dealerdashboard",
      icon: LayoutDashboard,
      
    },
    {
      title: "Messages",
      url: "/messages",
      icon: MessageSquare,
    },
  ],
  navSecondary: [
   
    {
      title: "Support",
      url: "/support",
      icon: HelpCircle,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Command,
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="fixed left-0 top-[--header-height] bottom-0 z-50 w-[250px] flex flex-col bg-sidebar-primary text-white"
      {...props}
    >
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="border-b border-primary-800">
              <Link to="/">
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
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <SidebarContent className="flex flex-col justify-between h-full ">
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
