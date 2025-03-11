import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/app-sidebar";
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
      <AppSidebar />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-4 border-b-0px px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
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
        <main className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
