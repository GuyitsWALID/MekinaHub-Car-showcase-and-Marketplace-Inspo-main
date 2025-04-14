import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "../components/app-sidebar";
import DynamicBreadcrumbs from "../components/DynamicBreadcrumbs";
import { Separator } from "../components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import ThemeToggle from "./ThemeToggle";
import ChatBotUI from "./ChatBotUI";
import { Bot } from "lucide-react";

export default function Layout() {
  const [showChatBot, setShowChatBot] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Separate Header (Not Sticky) */}
          <header className="bg-background h-16 flex items-center gap-4 px-4 border-b shadow-md">
           
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center justify-between w-full">
              <div className="flex-1 text-primary-500">
                <DynamicBreadcrumbs />
              </div>
              <div className="flex-3 mr-4">
                {showChatBot ? (
                  <ChatBotUI />
                ) : (
                  <button
                    onClick={() => setShowChatBot(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                  >
                    <Bot className="size-4" />
                  </button>
                )}
              </div>
              <div className="flex-2">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main Page Content */}
          <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
